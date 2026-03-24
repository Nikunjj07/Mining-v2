/**
 * Seed script for Industrial Disaster Management Platform
 * Creates demo users, shifts, emergencies, hazards, and notifications
 *
 * Run with: npm run seed
 */

import { User, type IUser } from '../models/User.model.js';
import { ShiftLog } from '../models/ShiftLog.model.js';
import { Emergency } from '../models/Emergency.model.js';
import { Hazard } from '../models/Hazard.model.js';
import { Notification } from '../models/Notification.model.js';
import { ShiftAcknowledgement } from '../models/ShiftAcknowledgement.model.js';
import { UserLocation } from '../models/UserLocation.model.js';
import { connectDatabase } from '../config/database.js';

// Demo user passwords (same for all demo accounts)
const DEMO_PASSWORD = 'Demo@123';

// Demo users
const demoUsers = [
  {
    email: 'admin@mine.com',
    full_name: 'John Admin',
    role: 'admin' as const,
    phone_number: '+1234567890',
  },
  {
    email: 'supervisor@mine.com',
    full_name: 'Sarah Supervisor',
    role: 'supervisor' as const,
    phone_number: '+1234567891',
  },
  {
    email: 'supervisor2@mine.com',
    full_name: 'Mike Supervisor',
    role: 'supervisor' as const,
    phone_number: '+1234567892',
  },
  {
    email: 'worker@mine.com',
    full_name: 'Tom Worker',
    role: 'worker' as const,
    phone_number: '+1234567893',
  },
  {
    email: 'worker2@mine.com',
    full_name: 'Lisa Worker',
    role: 'worker' as const,
    phone_number: '+1234567894',
  },
  {
    email: 'rescue@mine.com',
    full_name: 'Bob Rescue',
    role: 'rescue' as const,
    phone_number: '+1234567895',
  },
  {
    email: 'rescue2@mine.com',
    full_name: 'Amy Rescue',
    role: 'rescue' as const,
    phone_number: '+1234567896',
  },
];

// Demo hazards
const demoHazards = [
  {
    hazard_name: 'Methane Gas Accumulation',
    description: 'Potential methane buildup in Section B tunnels due to inadequate ventilation',
    risk_level: 'high' as const,
    control_measure: 'Install additional ventilation fans, mandatory gas detection equipment',
    responsible_person: 'Safety Officer',
    review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    status: 'active',
  },
  {
    hazard_name: 'Unstable Roof Support',
    description: 'Weakened roof bolts in Mine Shaft 3, Section C',
    risk_level: 'high' as const,
    control_measure: 'Immediate reinforcement of roof supports, restricted access until repaired',
    responsible_person: 'Structural Engineer',
    review_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'active',
  },
  {
    hazard_name: 'Water Seepage',
    description: 'Minor water seepage detected in lower levels of Section A',
    risk_level: 'medium' as const,
    control_measure: 'Monitor water levels, install pumping equipment if necessary',
    responsible_person: 'Maintenance Team Lead',
    review_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    status: 'active',
  },
  {
    hazard_name: 'Conveyor Belt Wear',
    description: 'Conveyor belt showing signs of wear at junction points',
    risk_level: 'low' as const,
    control_measure: 'Schedule replacement during next maintenance window',
    responsible_person: 'Equipment Manager',
    review_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    status: 'active',
  },
  {
    hazard_name: 'Dust Accumulation',
    description: 'Coal dust accumulation in ventilation ducts',
    risk_level: 'medium' as const,
    control_measure: 'Regular cleaning schedule, water suppression systems',
    responsible_person: 'Ventilation Supervisor',
    review_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'active',
  },
];

async function seed() {
  console.log('Starting seed process...\n');

  try {
    // Connect to database
    await connectDatabase();

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      ShiftLog.deleteMany({}),
      Emergency.deleteMany({}),
      Hazard.deleteMany({}),
      Notification.deleteMany({}),
      ShiftAcknowledgement.deleteMany({}),
      UserLocation.deleteMany({}),
    ]);
    console.log('Existing data cleared.\n');

    // Create users
    console.log('Creating demo users...');
    const createdUsers: IUser[] = [];
    for (const userData of demoUsers) {
      const user = new User({
        ...userData,
        password: DEMO_PASSWORD,
      });
      await user.save();
      createdUsers.push(user);
      console.log(`  Created: ${userData.email} (${userData.role})`);
    }
    console.log(`Created ${createdUsers.length} users.\n`);

    // Get user references
    const adminUser = createdUsers.find(u => u.role === 'admin')!;
    const supervisorUsers = createdUsers.filter(u => u.role === 'supervisor');
    const workerUsers = createdUsers.filter(u => u.role === 'worker');
    const rescueUsers = createdUsers.filter(u => u.role === 'rescue');

    // Create hazards
    console.log('Creating demo hazards...');
    const createdHazards = await Hazard.insertMany(demoHazards);
    console.log(`Created ${createdHazards.length} hazards.\n`);

    // Create shift logs
    console.log('Creating demo shift logs...');
    const shiftLogs = [
      {
        shift: 'morning' as const,
        production_summary: 'Extracted 450 tons of coal. Equipment running at 95% efficiency.',
        equipment_status: 'All primary equipment operational. Minor maintenance on Conveyor B.',
        safety_issues: 'None reported. All safety protocols followed.',
        red_flag: false,
        next_shift_instructions: 'Continue normal operations. Monitor ventilation in Section C.',
        acknowledged: true,
        created_by: supervisorUsers[0]._id,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        shift: 'evening' as const,
        production_summary: 'Extracted 380 tons of coal. Slight reduction due to equipment maintenance.',
        equipment_status: 'Conveyor B back online. All systems operational.',
        safety_issues: 'Minor dust levels elevated in Section A - increased water suppression.',
        red_flag: false,
        next_shift_instructions: 'Check dust suppression systems. Resume full production.',
        acknowledged: true,
        created_by: supervisorUsers[1]._id,
        created_at: new Date(Date.now() - 16 * 60 * 60 * 1000),
      },
      {
        shift: 'night' as const,
        production_summary: 'Detected gas leak warning in Section B. Production halted for safety check.',
        equipment_status: 'Gas detection systems triggered alert. Area evacuated.',
        safety_issues: 'CRITICAL: Gas leak detected. Area sealed pending investigation.',
        red_flag: true,
        next_shift_instructions: 'DO NOT ENTER Section B until safety team clearance. Full investigation required.',
        acknowledged: false,
        created_by: supervisorUsers[0]._id,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        shift: 'morning' as const,
        production_summary: 'Section B cleared after gas leak investigation. Normal operations resumed in other sections.',
        equipment_status: 'Ventilation systems enhanced. Gas detectors recalibrated.',
        safety_issues: 'Gas leak source identified and fixed. Monitoring continues.',
        red_flag: false,
        next_shift_instructions: 'Gradual restart of Section B operations. Extra monitoring required.',
        acknowledged: false,
        created_by: supervisorUsers[1]._id,
        created_at: new Date(),
      },
    ];
    const createdShiftLogs = await ShiftLog.insertMany(shiftLogs);
    console.log(`Created ${createdShiftLogs.length} shift logs.\n`);

    // Create emergencies
    console.log('Creating demo emergencies...');
    const emergencies = [
      {
        type: 'gas_leak' as const,
        severity: 'high' as const,
        location: 'Section B - Tunnel 3',
        description: 'Methane levels exceeded safe limits. Area evacuated immediately.',
        latitude: 28.6139,
        longitude: 77.2090,
        status: 'in_progress' as const,
        reported_by: supervisorUsers[0]._id,
        assigned_to: rescueUsers[0]._id,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        type: 'equipment_failure' as const,
        severity: 'medium' as const,
        location: 'Section A - Main Shaft',
        description: 'Primary ventilation fan malfunction. Backup systems active.',
        latitude: 28.6149,
        longitude: 77.2100,
        status: 'resolved' as const,
        reported_by: workerUsers[0]._id,
        assigned_to: rescueUsers[1]._id,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000),
        resolved_at: new Date(Date.now() - 44 * 60 * 60 * 1000),
      },
      {
        type: 'fire' as const,
        severity: 'high' as const,
        location: 'Surface - Equipment Storage',
        description: 'Small fire in equipment storage area. Fire suppression activated.',
        latitude: 28.6159,
        longitude: 77.2080,
        status: 'resolved' as const,
        reported_by: workerUsers[1]._id,
        assigned_to: rescueUsers[0]._id,
        created_at: new Date(Date.now() - 72 * 60 * 60 * 1000),
        resolved_at: new Date(Date.now() - 70 * 60 * 60 * 1000),
      },
      {
        type: 'collapse' as const,
        severity: 'low' as const,
        location: 'Section C - Storage Area',
        description: 'Minor debris fall from ceiling. No injuries. Area cordoned off.',
        latitude: 28.6169,
        longitude: 77.2070,
        status: 'active' as const,
        reported_by: supervisorUsers[1]._id,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];
    const createdEmergencies = await Emergency.insertMany(emergencies);
    console.log(`Created ${createdEmergencies.length} emergencies.\n`);

    // Create notifications
    console.log('Creating demo notifications...');
    const notifications = [
      // Notifications for admin
      {
        user_id: adminUser._id,
        type: 'emergency_created' as const,
        title: 'High Severity Emergency',
        message: 'Gas leak detected in Section B - Tunnel 3. Immediate attention required.',
        related_id: createdEmergencies[0]._id.toString(),
        related_table: 'emergencies',
        read: false,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        user_id: adminUser._id,
        type: 'shift_acknowledgment_required' as const,
        title: 'Shift Log Pending Acknowledgment',
        message: 'Night shift log from Sarah Supervisor requires acknowledgment.',
        related_id: createdShiftLogs[2]._id.toString(),
        related_table: 'shift_logs',
        read: false,
        created_at: new Date(Date.now() - 7 * 60 * 60 * 1000),
      },
      // Notifications for rescue team
      {
        user_id: rescueUsers[0]._id,
        type: 'emergency_assigned' as const,
        title: 'Emergency Assignment',
        message: 'You have been assigned to respond to a gas leak in Section B.',
        related_id: createdEmergencies[0]._id.toString(),
        related_table: 'emergencies',
        read: true,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        user_id: rescueUsers[1]._id,
        type: 'emergency_status_changed' as const,
        title: 'Emergency Resolved',
        message: 'Equipment failure emergency has been marked as resolved.',
        related_id: createdEmergencies[1]._id.toString(),
        related_table: 'emergencies',
        read: true,
        created_at: new Date(Date.now() - 44 * 60 * 60 * 1000),
      },
      // Notifications for supervisors
      {
        user_id: supervisorUsers[0]._id,
        type: 'emergency_status_changed' as const,
        title: 'Emergency Update',
        message: 'Gas leak emergency status changed to in_progress.',
        related_id: createdEmergencies[0]._id.toString(),
        related_table: 'emergencies',
        read: false,
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];
    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`Created ${createdNotifications.length} notifications.\n`);

    // Create user locations (active personnel)
    console.log('Creating demo user locations...');
    const userLocations = [
      {
        user_id: supervisorUsers[0]._id,
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 10,
        is_active: true,
      },
      {
        user_id: workerUsers[0]._id,
        latitude: 28.6145,
        longitude: 77.2095,
        accuracy: 15,
        is_active: true,
      },
      {
        user_id: rescueUsers[0]._id,
        latitude: 28.6142,
        longitude: 77.2088,
        accuracy: 8,
        is_active: true,
      },
    ];
    const createdLocations = await UserLocation.insertMany(userLocations);
    console.log(`Created ${createdLocations.length} user locations.\n`);

    // Summary
    console.log('========================================');
    console.log('SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log('\nDemo Accounts (password for all: Demo@123):');
    console.log('  Admin:      admin@mine.com');
    console.log('  Supervisor: supervisor@mine.com, supervisor2@mine.com');
    console.log('  Worker:     worker@mine.com, worker2@mine.com');
    console.log('  Rescue:     rescue@mine.com, rescue2@mine.com');
    console.log('\nData Created:');
    console.log(`  Users:         ${createdUsers.length}`);
    console.log(`  Hazards:       ${createdHazards.length}`);
    console.log(`  Shift Logs:    ${createdShiftLogs.length}`);
    console.log(`  Emergencies:   ${createdEmergencies.length}`);
    console.log(`  Notifications: ${createdNotifications.length}`);
    console.log(`  Locations:     ${createdLocations.length}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
