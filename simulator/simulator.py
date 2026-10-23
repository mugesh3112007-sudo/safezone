#!/usr/bin/env python3
"""
SafeZone Simulator — spawns fake attendees, moves them between zones,
and provides controls for crowd surges and test SOS alerts.

Usage:
  python simulator.py                    # Run interactive simulator
  python simulator.py --auto             # Auto-run with 300 attendees
  python simulator.py --surge "Main Stage"  # Trigger crowd surge in a zone
  python simulator.py --sos "Food Court"    # Fire test SOS from a zone
"""

import asyncio
import aiohttp
import argparse
import random
import time
import json
import sys

API_BASE = "http://localhost:8000/api"

# Zone movement probabilities (where attendees tend to go)
ZONE_WEIGHTS = {
    "Main Stage": 0.35,
    "Food Court": 0.25,
    "Workshop Hall": 0.15,
    "Gate 1": 0.10,
    "Parking": 0.05,
    "Restroom Block A": 0.10,
}

class Simulator:
    def __init__(self, api_base=API_BASE):
        self.api_base = api_base
        self.event_id = None
        self.zones = {}  # name -> zone_id
        self.zone_list = []  # list of zone objects
        self.attendees = []  # list of {session_token, zone_id, zone_name}
        self.session = None

    async def setup(self):
        """Connect to API and fetch event/zone data."""
        self.session = aiohttp.ClientSession()
        
        # Get the demo event
        async with self.session.get(f"{self.api_base}/events") as resp:
            events = await resp.json()
            if not events:
                print("❌ No events found. Run the backend with seed data first.")
                sys.exit(1)
            # Find Dexathon Fest or use the first event
            event = next((e for e in events if "Dexathon" in e.get("name", "")), events[0])
            self.event_id = event["id"]
            print(f"📍 Event: {event['name']} (ID: {self.event_id})")

        # Get zones
        async with self.session.get(f"{self.api_base}/events/{self.event_id}/zones") as resp:
            self.zone_list = await resp.json()
            for z in self.zone_list:
                self.zones[z["name"]] = z["id"]
            print(f"🗺️  Zones: {', '.join(self.zones.keys())}")

    async def spawn_attendees(self, count=300):
        """Check in a batch of fake attendees."""
        print(f"\n👥 Spawning {count} attendees...")
        zone_names = list(self.zones.keys())
        
        tasks = []
        for i in range(count):
            # Weighted zone assignment
            zone_name = random.choices(
                zone_names,
                weights=[ZONE_WEIGHTS.get(z, 0.1) for z in zone_names],
                k=1
            )[0]
            tasks.append(self._checkin_attendee(zone_name, i))
        
        # Process in batches of 50 to avoid overwhelming the server
        batch_size = 50
        for batch_start in range(0, len(tasks), batch_size):
            batch = tasks[batch_start:batch_start + batch_size]
            results = await asyncio.gather(*batch, return_exceptions=True)
            success = sum(1 for r in results if not isinstance(r, Exception))
            print(f"  ✅ Batch {batch_start//batch_size + 1}: {success}/{len(batch)} checked in")
        
        print(f"  Total attendees spawned: {len(self.attendees)}")

    async def _checkin_attendee(self, zone_name, index):
        """Check in a single attendee."""
        zone_id = self.zones[zone_name]
        data = {"zone": zone_name}
        async with self.session.post(
            f"{self.api_base}/events/{self.event_id}/checkin",
            json=data
        ) as resp:
            if resp.status in (200, 201):
                result = await resp.json()
                self.attendees.append({
                    "session_token": result.get("session_token", result.get("token", "")),
                    "session_id": result.get("id", result.get("session_id", "")),
                    "zone_id": zone_id,
                    "zone_name": zone_name,
                })
            else:
                text = await resp.text()
                raise Exception(f"Checkin failed ({resp.status}): {text}")

    async def move_attendees(self, duration_seconds=60):
        """Randomly move attendees between zones over time."""
        print(f"\n🔄 Moving attendees for {duration_seconds}s...")
        zone_names = list(self.zones.keys())
        start = time.time()
        
        while time.time() - start < duration_seconds:
            # Move ~10% of attendees each cycle
            movers = random.sample(
                self.attendees,
                min(len(self.attendees) // 10, len(self.attendees))
            )
            
            tasks = []
            for att in movers:
                new_zone = random.choices(
                    zone_names,
                    weights=[ZONE_WEIGHTS.get(z, 0.1) for z in zone_names],
                    k=1
                )[0]
                if new_zone != att["zone_name"]:
                    tasks.append(self._move_attendee(att, new_zone))
            
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
                print(f"  🚶 Moved {len(tasks)} attendees (elapsed: {int(time.time()-start)}s)")
            
            await asyncio.sleep(2)

    async def _move_attendee(self, attendee, new_zone_name):
        """Move a single attendee to a new zone."""
        new_zone_id = self.zones[new_zone_name]
        try:
            async with self.session.post(
                f"{self.api_base}/attendees/{attendee['session_id']}/zone",
                json={"zone_id": new_zone_id}
            ) as resp:
                if resp.status in (200, 201):
                    attendee["zone_id"] = new_zone_id
                    attendee["zone_name"] = new_zone_name
        except Exception:
            pass

    async def trigger_crowd_surge(self, zone_name):
        """Flood a zone to trigger a crowd warning."""
        if zone_name not in self.zones:
            print(f"❌ Zone '{zone_name}' not found. Available: {', '.join(self.zones.keys())}")
            return
        
        zone = next(z for z in self.zone_list if z["name"] == zone_name)
        target_count = int(zone["capacity"] * 0.95)  # 95% capacity
        current_in_zone = sum(1 for a in self.attendees if a["zone_name"] == zone_name)
        needed = target_count - current_in_zone
        
        print(f"\n🌊 Crowd surge: {zone_name}")
        print(f"   Capacity: {zone['capacity']}, Current: {current_in_zone}, Moving: {max(0, needed)}")
        
        if needed <= 0:
            print(f"   Zone already at/above target!")
            return
        
        # Move attendees from other zones to this zone
        others = [a for a in self.attendees if a["zone_name"] != zone_name]
        movers = random.sample(others, min(needed, len(others)))
        
        tasks = [self._move_attendee(a, zone_name) for a in movers]
        await asyncio.gather(*tasks, return_exceptions=True)
        
        new_count = sum(1 for a in self.attendees if a["zone_name"] == zone_name)
        print(f"   ✅ Zone now at {new_count}/{zone['capacity']} ({int(new_count/zone['capacity']*100)}%)")

    async def trigger_test_sos(self, zone_name):
        """Fire a test SOS alert from a random attendee in the specified zone."""
        if zone_name not in self.zones:
            print(f"❌ Zone '{zone_name}' not found")
            return
        
        zone_attendees = [a for a in self.attendees if a["zone_name"] == zone_name]
        if not zone_attendees:
            print(f"❌ No attendees in {zone_name}")
            return
        
        att = random.choice(zone_attendees)
        zone_id = self.zones[zone_name]
        
        print(f"\n🆘 Test SOS from {zone_name}")
        
        data = {
            "session_token": att["session_token"],
            "event_id": self.event_id,
            "zone_id": zone_id,
            "alert_type": "sos",
        }
        
        async with self.session.post(f"{self.api_base}/alerts", json=data) as resp:
            if resp.status in (200, 201):
                alert = await resp.json()
                guard_name = alert.get("guard_name", alert.get("guard", {}).get("name", "Unknown"))
                print(f"   ✅ Alert created: {alert.get('id', 'N/A')}")
                print(f"   🛡️  Assigned to: {guard_name}")
                print(f"   📍 Zone: {zone_name}")
                
                # Auto-resolve after 10 seconds for demo
                await asyncio.sleep(10)
                alert_id = alert.get("id", alert.get("alert_id"))
                if alert_id:
                    async with self.session.put(
                        f"{self.api_base}/alerts/{alert_id}/status",
                        json={"status": "resolved"}
                    ) as resp2:
                        if resp2.status == 200:
                            print(f"   ✅ Alert auto-resolved after 10s")
            else:
                text = await resp.text()
                print(f"   ❌ Failed ({resp.status}): {text}")

    async def show_dashboard_stats(self):
        """Print current dashboard stats."""
        async with self.session.get(
            f"{self.api_base}/events/{self.event_id}/dashboard"
        ) as resp:
            if resp.status in (200, 201):
                stats = await resp.json()
                print("\n📊 Dashboard Stats:")
                print(f"   Active Attendees: {stats.get('active_attendees', 'N/A')}")
                print(f"   Avg Response Time: {stats.get('avg_response_time', 'N/A')}s")
                print(f"   False Alarm Rate: {stats.get('false_alarm_rate', 'N/A')}%")
                print(f"   Active Alerts: {stats.get('active_alerts', 'N/A')}")
                
                zones = stats.get('zones', stats.get('zone_densities', []))
                if zones:
                    print("   Zone Densities:")
                    for z in zones:
                        name = z.get('name', z.get('zone_name', ''))
                        density = z.get('density', z.get('density_pct', 0))
                        print(f"     {name}: {density}%")

    async def interactive_menu(self):
        """Show interactive menu for manual control."""
        while True:
            print("\n" + "="*50)
            print("🎮 SafeZone Simulator Controls")
            print("="*50)
            print("1. Spawn attendees (300)")
            print("2. Move attendees randomly (60s)")
            print("3. Trigger crowd surge")
            print("4. Fire test SOS")
            print("5. Show dashboard stats")
            print("6. Run full auto-demo")
            print("0. Exit")
            print("="*50)
            
            try:
                choice = input("\nChoice: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            
            if choice == "1":
                await self.spawn_attendees(300)
            elif choice == "2":
                await self.move_attendees(60)
            elif choice == "3":
                zone = input("Zone name (e.g. 'Main Stage'): ").strip()
                await self.trigger_crowd_surge(zone)
            elif choice == "4":
                zone = input("Zone name (e.g. 'Food Court'): ").strip()
                await self.trigger_test_sos(zone)
            elif choice == "5":
                await self.show_dashboard_stats()
            elif choice == "6":
                await self.auto_demo()
            elif choice == "0":
                break

    async def auto_demo(self):
        """Run a full automated demo sequence."""
        print("\n🎬 Starting auto-demo sequence...\n")
        
        # Spawn attendees
        await self.spawn_attendees(300)
        await asyncio.sleep(2)
        
        # Show initial stats
        await self.show_dashboard_stats()
        await asyncio.sleep(2)
        
        # Move people around for 30 seconds
        print("\n🔄 Simulating crowd movement for 30 seconds...")
        await self.move_attendees(30)
        
        # Trigger crowd surge
        await self.trigger_crowd_surge("Main Stage")
        await asyncio.sleep(3)
        
        # Show updated stats
        await self.show_dashboard_stats()
        await asyncio.sleep(2)
        
        # Fire test SOS
        await self.trigger_test_sos("Food Court")
        await asyncio.sleep(3)
        
        # Final stats
        await self.show_dashboard_stats()
        
        print("\n🎬 Auto-demo complete!")

    async def cleanup(self):
        if self.session:
            await self.session.close()


async def main():
    parser = argparse.ArgumentParser(description="SafeZone Simulator")
    parser.add_argument("--auto", action="store_true", help="Run full auto-demo")
    parser.add_argument("--surge", type=str, help="Trigger crowd surge in zone")
    parser.add_argument("--sos", type=str, help="Fire test SOS from zone")
    parser.add_argument("--spawn", type=int, help="Spawn N attendees")
    args = parser.parse_args()
    
    sim = Simulator()
    try:
        await sim.setup()
        
        if args.auto:
            await sim.auto_demo()
        elif args.surge:
            await sim.spawn_attendees(100)  # Need some attendees first
            await sim.trigger_crowd_surge(args.surge)
        elif args.sos:
            await sim.spawn_attendees(50)  # Need some attendees first
            await sim.trigger_test_sos(args.sos)
        elif args.spawn:
            await sim.spawn_attendees(args.spawn)
        else:
            await sim.interactive_menu()
    except KeyboardInterrupt:
        print("\n👋 Simulator stopped.")
    finally:
        await sim.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
