import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface RoomDefinition {
  floor: number;
  wing: string;
  number: string;
  capacity: number;
  type: "ROOM" | "STORAGE";
}

/**
 * BUILDING LAYOUT GENERATOR
 * 
 * Structure for 6 Floors:
 * ─────────────────────────────────────────
 * Wing A: Rooms X01-X06 (6 rooms, 3-bed each)
 * Wing A: Room X07 (Storage/Study room)
 * 
 * Wing B: Rooms X08-X12 (5 rooms, 3-bed each)
 * Wing B: Room X13 (Storage/Study room)
 * 
 * Wing C: Rooms X14-X19 (6 rooms, 3-bed each)
 * Wing C: Room X20 (Storage/Study room)
 * 
 * Wing D: Rooms X21-X25 (5 rooms, 3-bed each)
 * Wing D: Room X26 (Storage/Study room)
 * 
 * X = Floor number (1 to 6)
 * ─────────────────────────────────────────
 * 
 * Total per floor: 22 rooms (19 regular + 3 special)
 * Total for 6 floors: 132 rooms
 * Total capacity: ~390 students
 */
function generateBuildingLayout(): RoomDefinition[] {
  const rooms: RoomDefinition[] = [];
  const floors = [1, 2, 3, 4, 5, 6];
  const wings = ["A", "B", "C", "D"];

  floors.forEach((floor) => {
    // Wing A: Rooms X01-X06
    for (let i = 1; i <= 6; i++) {
      rooms.push({
        floor,
        wing: "A",
        number: `${floor}0${i}`, // e.g., 101, 102, ..., 106
        capacity: 3,
        type: "ROOM",
      });
    }
    // Wing A Special: X07 (Storage/Study)
    rooms.push({
      floor,
      wing: "A",
      number: `${floor}07`,
      capacity: 0,
      type: "STORAGE",
    });

    // Wing B: Rooms X08-X12
    for (let i = 8; i <= 12; i++) {
      rooms.push({
        floor,
        wing: "B",
        number: `${floor}${i}`, // e.g., 108, 109, ..., 112
        capacity: 3,
        type: "ROOM",
      });
    }
    // Wing B Special: X13 (Storage/Study)
    rooms.push({
      floor,
      wing: "B",
      number: `${floor}13`,
      capacity: 0,
      type: "STORAGE",
    });

    // Wing C: Rooms X14-X19
    for (let i = 14; i <= 19; i++) {
      rooms.push({
        floor,
        wing: "C",
        number: `${floor}${i}`, // e.g., 114, 115, ..., 119
        capacity: 3,
        type: "ROOM",
      });
    }
    // Wing C Special: X20 (Storage/Study)
    rooms.push({
      floor,
      wing: "C",
      number: `${floor}20`,
      capacity: 0,
      type: "STORAGE",
    });

    // Wing D: Rooms X21-X25
    for (let i = 21; i <= 25; i++) {
      rooms.push({
        floor,
        wing: "D",
        number: `${floor}${i}`, // e.g., 121, 122, ..., 125
        capacity: 3,
        type: "ROOM",
      });
    }
    // Wing D Special: X26 (Storage/Study)
    rooms.push({
      floor,
      wing: "D",
      number: `${floor}26`,
      capacity: 0,
      type: "STORAGE",
    });
  });

  return rooms;
}

async function seedRooms() {
  console.log("🏗️  Starting Room Seeding Process...");

  try {
    // Delete existing rooms to avoid duplicates
    console.log("🧹 Clearing existing rooms...");
    await prisma.room.deleteMany({});
    console.log("✓ Cleared existing rooms");

    // Ensure we have at least one building
    let building = await prisma.building.findFirst();

    if (!building) {
      console.log("📍 Creating default building...");
      building = await prisma.building.create({
        data: {
          name: "Main Housing Complex",
          code: "MAIN",
          gender: "MIXED",
          location: "Campus Center",
          capacity: 500,
        },
      });
      console.log(`✓ Created building: ${building.name}`);
    }

    // Generate building layout
    const roomDefinitions = generateBuildingLayout();
    console.log(`\n🔧 Generated ${roomDefinitions.length} room definitions`);

    // Create all rooms
    console.log("📝 Creating rooms...");
    const createdRooms = await Promise.all(
      roomDefinitions.map((roomDef) =>
        prisma.room.create({
          data: {
            buildingId: building.id,
            number: roomDef.number,
            floor: roomDef.floor,
            wing: roomDef.wing,
            capacity: roomDef.capacity,
            type: roomDef.type,
            gender: null, // Will be determined by occupancy
          },
        })
      )
    );

    console.log(`✓ Created ${createdRooms.length} rooms`);

    // Print summary statistics
    const wingStats = new Map<string, number>();
    const floorStats = new Map<number, number>();

    createdRooms.forEach((room) => {
      wingStats.set(room.wing, (wingStats.get(room.wing) || 0) + 1);
      floorStats.set(room.floor, (floorStats.get(room.floor) || 0) + 1);
    });

    console.log("\n📊 Summary Statistics:");
    console.log("─────────────────────────────────");

    console.log("\n🏢 By Wing:");
    Array.from(wingStats.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([wing, count]) => {
        console.log(`   Wing ${wing}: ${count} rooms`);
      });

    console.log("\n🪜 By Floor:");
    Array.from(floorStats.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([floor, count]) => {
        console.log(`   Floor ${floor}: ${count} rooms`);
      });

    const totalCapacity = createdRooms
      .filter((r) => r.type === "ROOM")
      .reduce((sum, r) => sum + r.capacity, 0);

    console.log("\n📈 Capacity:");
    console.log(`   Total Rooms: ${createdRooms.filter((r) => r.type === "ROOM").length}`);
    console.log(`   Storage Rooms: ${createdRooms.filter((r) => r.type === "STORAGE").length}`);
    console.log(`   Total Capacity: ${totalCapacity} students`);

    console.log("\n✅ Room seeding completed successfully!\n");
  } catch (error) {
    console.error("❌ Error during room seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRooms();
