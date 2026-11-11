import sqlite3
import uuid
import datetime

def run_seed():
    conn = sqlite3.connect('backend/school_erp.db')
    c = conn.cursor()

    # 1. Clear out old vehicle_trips, route_stops, and transport_routes
    c.execute("DELETE FROM vehicle_trips")
    c.execute("DELETE FROM route_stops")
    c.execute("DELETE FROM transport_routes")

    # 2. Add extra vehicles if not exist
    vehicles_data = [
        ('KA-01-EA-4921', 35, 'Tata Starbus Ultra (35 Seater AC)', 'GPS-98214', '9ff7667f-d39f-4a99-8586-f113e7081e35'),
        ('KA-01-EA-4922', 40, 'Ashok Leyland Sunshine (40 Seater)', 'GPS-98215', 'fc5f7739-5e40-483d-bffd-4f5f3dee205e'),
        ('KA-01-FA-5830', 45, 'BharatBenz 1017 Deluxe (45 Seater AC)', 'GPS-98216', '3a1e94b2-4d2a-4a6c-9c3a-81a1d3f5e001'),
        ('KA-01-FA-5831', 26, 'Force Traveller Monobus (26 Seater)', 'GPS-98217', '3a1e94b2-4d2a-4a6c-9c3a-81a1d3f5e002'),
        ('KA-01-GA-6102', 38, 'Eicher Skyline Pro 3009 (38 Seater)', 'GPS-98218', '3a1e94b2-4d2a-4a6c-9c3a-81a1d3f5e003'),
        ('KA-01-GA-6103', 18, 'Tata Winger Executive (18 Seater Mini)', 'GPS-98219', '3a1e94b2-4d2a-4a6c-9c3a-81a1d3f5e004'),
    ]

    for reg, cap, model, dev_id, v_id in vehicles_data:
        clean_id = v_id.replace('-', '')
        c.execute('SELECT id FROM vehicles WHERE id=?', (clean_id,))
        if not c.fetchone():
            c.execute('''INSERT INTO vehicles (id, registration_number, capacity, model, device_id, is_active, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))''',
                      (clean_id, reg, cap, model, dev_id))
        else:
            c.execute('UPDATE vehicles SET model=?, capacity=?, device_id=?, is_active=1 WHERE id=?',
                      (model, cap, dev_id, clean_id))

    # 3. Add extra drivers
    drivers_data = [
        ('Ramesh Kumar', '+91 98765 43210', 'DL-04-2015-8841', 'e845c9d5-ff48-400e-8b00-1964ec15eb5f'),
        ('Suresh Gowda', '+91 98765 43211', 'DL-04-2018-9123', '63545c3b-4c98-461a-a292-a25ec039e30b'),
        ('Manjunath Swamy', '+91 98451 22334', 'DL-05-2016-7712', '4b2f83c1-5e3b-4b7d-8d4b-92b2e4f6a001'),
        ('Venkatesh Murthy', '+91 98452 33445', 'DL-05-2019-3341', '4b2f83c1-5e3b-4b7d-8d4b-92b2e4f6a002'),
        ('Anthony Raj', '+91 98453 44556', 'DL-06-2017-5592', '4b2f83c1-5e3b-4b7d-8d4b-92b2e4f6a003'),
        ('Anand Kulkarni', '+91 98454 55667', 'DL-06-2020-1128', '4b2f83c1-5e3b-4b7d-8d4b-92b2e4f6a004'),
    ]

    for name, phone, lic, d_id in drivers_data:
        clean_id = d_id.replace('-', '')
        c.execute('SELECT id FROM drivers WHERE id=?', (clean_id,))
        if not c.fetchone():
            c.execute('''INSERT INTO drivers (id, full_name, phone_number, license_number, is_active, created_at, updated_at)
                         VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))''',
                      (clean_id, name, phone, lic))
        else:
            c.execute('UPDATE drivers SET phone_number=?, license_number=?, is_active=1 WHERE id=?',
                      (phone, lic, clean_id))

    # 4. Add Routes and Stops
    routes_data = [
        ('d78b3eb27f1f4a53835550cd82c33877', 'Route 1 - Indiranagar & Domlur Express', 'pickup', '07:00:00', '08:15:00', '9ff7667fd39f4a998586f113e7081e35', 'e845c9d5ff48400e8b001964ec15eb5f', [
            ('8611fb4ef31b413ea1a485c2e736feda', 'City Central Bus Terminus', 12.9716, 77.5946, 1, '07:10:00'),
            ('0c9adb62c8bb4bae90c3d357b3f0ffe6', 'Indiranagar Metro Station', 12.9784, 77.6408, 2, '07:35:00'),
            ('1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c01', 'Domlur Flyover Junction', 12.9609, 77.6387, 3, '07:45:00'),
            ('5a2a219da2354a7d9255ce99be6eb2fd', 'Ever Grow Main Campus Gate', 12.9902, 77.6875, 4, '08:00:00')
        ]),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f01', 'Route 2 - Whitefield & ITPL Express', 'pickup', '06:55:00', '08:10:00', 'fc5f77395e40483dbffd4f5f3dee205e', '63545c3b4c98461aa292a25ec039e30b', [
            ('b1c2d3e4f5a6b7c8d9e0f1a2b3c4d501', 'Hope Farm Junction Whitefield', 12.9839, 77.7519, 1, '07:05:00'),
            ('b1c2d3e4f5a6b7c8d9e0f1a2b3c4d502', 'ITPL Tech Park Main Gate', 12.9872, 77.7374, 2, '07:20:00'),
            ('b1c2d3e4f5a6b7c8d9e0f1a2b3c4d503', 'Hoodi Circle Signal', 12.9918, 77.7161, 3, '07:35:00'),
            ('b1c2d3e4f5a6b7c8d9e0f1a2b3c4d504', 'KR Puram Metro Station', 13.0012, 77.6931, 4, '07:50:00'),
            ('b1c2d3e4f5a6b7c8d9e0f1a2b3c4d505', 'Ever Grow Main Campus Gate', 12.9902, 77.6875, 5, '08:05:00')
        ]),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f02', 'Route 3 - Koramangala & HSR Shuttle', 'pickup', '07:05:00', '08:15:00', '3a1e94b24d2a4a6c9c3a81a1d3f5e001', '4b2f83c15e3b4b7d8d4b92b2e4f6a001', [
            ('c1c2d3e4f5a6b7c8d9e0f1a2b3c4d501', 'Koramangala 5th Block BDA', 12.9352, 77.6245, 1, '07:15:00'),
            ('c1c2d3e4f5a6b7c8d9e0f1a2b3c4d502', 'Sony World Signal 80ft Road', 12.9385, 77.6301, 2, '07:25:00'),
            ('c1c2d3e4f5a6b7c8d9e0f1a2b3c4d503', 'HSR Layout Sector 1 BDA', 12.9121, 77.6446, 3, '07:40:00'),
            ('c1c2d3e4f5a6b7c8d9e0f1a2b3c4d504', 'Agara Lake View Point', 12.9248, 77.6508, 4, '07:50:00'),
            ('c1c2d3e4f5a6b7c8d9e0f1a2b3c4d505', 'Ever Grow Main Campus Gate', 12.9902, 77.6875, 5, '08:10:00')
        ]),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f03', 'Route 4 - Jayanagar & JP Nagar Transit', 'pickup', '07:00:00', '08:20:00', '3a1e94b24d2a4a6c9c3a81a1d3f5e002', '4b2f83c15e3b4b7d8d4b92b2e4f6a002', [
            ('d1c2d3e4f5a6b7c8d9e0f1a2b3c4d501', 'Jayanagar 4th Block Complex', 12.9298, 77.5833, 1, '07:10:00'),
            ('d1c2d3e4f5a6b7c8d9e0f1a2b3c4d502', 'JP Nagar Central Metro Depot', 12.9063, 77.5857, 2, '07:25:00'),
            ('d1c2d3e4f5a6b7c8d9e0f1a2b3c4d503', 'BTM Layout Water Tank', 12.9166, 77.6101, 3, '07:40:00'),
            ('d1c2d3e4f5a6b7c8d9e0f1a2b3c4d504', 'Silk Board Flyover Entry', 12.9176, 77.6234, 4, '07:55:00'),
            ('d1c2d3e4f5a6b7c8d9e0f1a2b3c4d505', 'Ever Grow Main Campus Gate', 12.9902, 77.6875, 5, '08:15:00')
        ]),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f04', 'Route 5 - Malleshwaram & Rajajinagar Link', 'pickup', '06:50:00', '08:15:00', '3a1e94b24d2a4a6c9c3a81a1d3f5e003', '4b2f83c15e3b4b7d8d4b92b2e4f6a003', [
            ('e1c2d3e4f5a6b7c8d9e0f1a2b3c4d501', 'Malleshwaram 8th Cross Playground', 13.0031, 77.5714, 1, '07:00:00'),
            ('e1c2d3e4f5a6b7c8d9e0f1a2b3c4d502', 'Rajajinagar 1st Block Metro', 12.9982, 77.5530, 2, '07:20:00'),
            ('e1c2d3e4f5a6b7c8d9e0f1a2b3c4d503', 'Yeshwanthpur TTMC Bus Terminal', 13.0223, 77.5499, 3, '07:35:00'),
            ('e1c2d3e4f5a6b7c8d9e0f1a2b3c4d504', 'Hebbal Flyover Junction', 13.0358, 77.5970, 4, '07:50:00'),
            ('e1c2d3e4f5a6b7c8d9e0f1a2b3c4d505', 'Ever Grow Main Campus Gate', 12.9902, 77.6875, 5, '08:10:00')
        ])
    ]

    for r_id, r_name, r_dir, r_start, r_end, r_veh, r_drv, stops in routes_data:
        c.execute('SELECT id FROM transport_routes WHERE id=?', (r_id,))
        if not c.fetchone():
            c.execute('''INSERT INTO transport_routes (id, name, direction, planned_start_time, planned_end_time, is_active, vehicle_id, driver_id, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, 1, ?, ?, datetime('now'), datetime('now'))''',
                      (r_id, r_name, r_dir, r_start, r_end, r_veh, r_drv))
        else:
            c.execute('UPDATE transport_routes SET name=?, vehicle_id=?, driver_id=?, is_active=1 WHERE id=?',
                      (r_name, r_veh, r_drv, r_id))
        
        for s_id, s_name, s_lat, s_lng, s_order, s_time in stops:
            c.execute('SELECT id FROM route_stops WHERE id=?', (s_id,))
            if not c.fetchone():
                c.execute('''INSERT INTO route_stops (id, route_id, name, latitude, longitude, stop_order, planned_time, created_at, updated_at)
                             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))''',
                          (s_id, r_id, s_name, s_lat, s_lng, s_order, s_time))
            else:
                c.execute('UPDATE route_stops SET name=?, latitude=?, longitude=?, stop_order=?, planned_time=? WHERE id=?',
                          (s_name, s_lat, s_lng, s_order, s_time, s_id))

    # 5. Create live started vehicle_trips for ALL 5 routes
    trip_locations = [
        ('d78b3eb27f1f4a53835550cd82c33877', '9ff7667fd39f4a998586f113e7081e35', 'e845c9d5ff48400e8b001964ec15eb5f', 12.9745, 77.6140, 36.0),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f01', 'fc5f77395e40483dbffd4f5f3dee205e', '63545c3b4c98461aa292a25ec039e30b', 12.9890, 77.7250, 38.0),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f02', '3a1e94b24d2a4a6c9c3a81a1d3f5e001', '4b2f83c15e3b4b7d8d4b92b2e4f6a001', 12.9280, 77.6380, 34.0),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f03', '3a1e94b24d2a4a6c9c3a81a1d3f5e002', '4b2f83c15e3b4b7d8d4b92b2e4f6a002', 12.9120, 77.5950, 32.0),
        ('a1b2c3d4e5f60718293a4b5c6d7e8f04', '3a1e94b24d2a4a6c9c3a81a1d3f5e003', '4b2f83c15e3b4b7d8d4b92b2e4f6a003', 13.0100, 77.5650, 40.0),
    ]

    for r_id, v_id, d_id, lat, lng, spd in trip_locations:
        t_id = uuid.uuid4().hex
        c.execute('''INSERT INTO vehicle_trips (id, route_id, vehicle_id, driver_id, trip_date, status, started_at, current_lat, current_lng, last_ping_at, current_speed, created_at, updated_at)
                     VALUES (?, ?, ?, ?, date('now'), 'started', datetime('now'), ?, ?, datetime('now'), ?, datetime('now'), datetime('now'))''',
                  (t_id, r_id, v_id, d_id, lat, lng, spd))

    # 6. Assign All 10 Students to Routes & Stops
    active_year = c.execute('SELECT id FROM academic_years WHERE is_active=1').fetchone()
    ay_id = active_year[0] if active_year else '85b7a9187e4c4ac3830d558f0c1e85cb'

    students = c.execute('SELECT id, admission_number, full_name, class_id, section_id FROM students').fetchall()
    assignments_map = [
        ('d78b3eb27f1f4a53835550cd82c33877', '0c9adb62c8bb4bae90c3d357b3f0ffe6'), # Route 1, Indiranagar
        ('d78b3eb27f1f4a53835550cd82c33877', '0c9adb62c8bb4bae90c3d357b3f0ffe6'), # Route 1, Indiranagar
        ('a1b2c3d4e5f60718293a4b5c6d7e8f01', 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d502'), # Route 2, ITPL
        ('a1b2c3d4e5f60718293a4b5c6d7e8f01', 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d503'), # Route 2, Hoodi
        ('a1b2c3d4e5f60718293a4b5c6d7e8f02', 'c1c2d3e4f5a6b7c8d9e0f1a2b3c4d503'), # Route 3, HSR
        ('a1b2c3d4e5f60718293a4b5c6d7e8f02', 'c1c2d3e4f5a6b7c8d9e0f1a2b3c4d501'), # Route 3, Koramangala
        ('a1b2c3d4e5f60718293a4b5c6d7e8f03', 'd1c2d3e4f5a6b7c8d9e0f1a2b3c4d502'), # Route 4, JP Nagar
        ('a1b2c3d4e5f60718293a4b5c6d7e8f03', 'd1c2d3e4f5a6b7c8d9e0f1a2b3c4d503'), # Route 4, BTM
        ('a1b2c3d4e5f60718293a4b5c6d7e8f04', 'e1c2d3e4f5a6b7c8d9e0f1a2b3c4d502'), # Route 5, Rajajinagar
        ('a1b2c3d4e5f60718293a4b5c6d7e8f04', 'e1c2d3e4f5a6b7c8d9e0f1a2b3c4d501'), # Route 5, Malleshwaram
    ]

    c.execute('DELETE FROM student_transport')
    for idx, s in enumerate(students):
        r_id, stop_id = assignments_map[idx % len(assignments_map)]
        st_id = uuid.uuid4().hex
        c.execute('''INSERT INTO student_transport (id, student_id, route_id, stop_id, academic_year_id, is_active, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))''',
                  (st_id, s[0], r_id, stop_id, ay_id))

    # Link student1's user_id properly and update names
    c.execute('UPDATE students SET full_name="Liam Smith" WHERE id=?', (students[0][0],))

    # 7. Seed Daily Attendance Records for All Students (Past 30 working days)
    c.execute("DELETE FROM student_attendance")

    today = datetime.date(2026, 11, 11)
    # Generate past 35 working days (exclude Sundays)
    dates = []
    curr = today
    while len(dates) < 32:
        if curr.weekday() != 6: # Not Sunday
            dates.append(curr)
        curr -= datetime.timedelta(days=1)

    subjects_pool = [
        "Mathematics, Physics, Chemistry | Verified by Class Faculty",
        "English Literature, Biology, Computer Science | Active STEM lab session",
        "Social Science, Mathematics, Physical Education | Standard 6-period timetable",
        "Chemistry, Physics, Computer Science | Laboratory experiment verified",
        "Mathematics, English, Environmental Studies | Complete attendance logged",
        "Biology, Chemistry, Hindi Language | Morning assembly & lecture attended",
    ]

    staff_user = c.execute("SELECT id FROM users WHERE username IN ('staff', 'teacher1', 'adrin')").fetchone()
    marked_by = staff_user[0] if staff_user else '94a6ac7b7d9f4ba0b0eca55812fdf8be'

    for s_idx, s in enumerate(students):
        s_id = s[0]
        c_id = s[3]
        sec_id = s[4]

        # Emma Smith (s_idx == 1): 100% attendance
        # Liam Smith (s_idx == 0): 1 day absent (on 2026-11-05), 1 late (on 2026-10-22), rest present (96.8%)
        # Others: mostly present with 1-2 absent or late
        for d_idx, dt in enumerate(dates):
            att_id = uuid.uuid4().hex
            date_str = dt.strftime('%Y-%m-%d')
            rem = subjects_pool[d_idx % len(subjects_pool)]

            status = 'present'
            if s_idx == 0 and d_idx == 4: # Liam Smith absent on Nov 5
                status = 'absent'
                rem = 'Excused medical leave | Parent guardian notified via automated SMS'
            elif s_idx == 0 and d_idx == 14: # Liam Smith late
                status = 'late'
                rem = 'Late gate entry 08:22 AM | Class Mentor Mrs. Anitha Raman'
            elif s_idx > 1 and (s_idx + d_idx) % 19 == 0:
                status = 'absent'
                rem = 'Unplanned absence | SMS notification dispatched to parent'
            elif s_idx > 1 and (s_idx + d_idx) % 13 == 0:
                status = 'late'
                rem = 'Arrived 15 mins late due to road transit delay'

            c.execute('''INSERT INTO student_attendance (id, student_id, class_id, section_id, academic_year_id, attendance_date, session, status, remarks, marked_by_user_id, is_locked, created_at, updated_at)
                         VALUES (?, ?, ?, ?, ?, ?, 'full_day', ?, ?, ?, 1, datetime('now'), datetime('now'))''',
                      (att_id, s_id, c_id, sec_id, ay_id, date_str, status, rem, marked_by))

    conn.commit()
    print("Seed Complete!")
    print("Routes:", c.execute('SELECT count(*) FROM transport_routes').fetchone()[0])
    print("Vehicles:", c.execute('SELECT count(*) FROM vehicles').fetchone()[0])
    print("Drivers:", c.execute('SELECT count(*) FROM drivers').fetchone()[0])
    print("Active Trips:", c.execute('SELECT count(*) FROM vehicle_trips WHERE status="started"').fetchone()[0])
    print("Student Transport rows:", c.execute('SELECT count(*) FROM student_transport').fetchone()[0])
    print("Student Attendance rows:", c.execute('SELECT count(*) FROM student_attendance').fetchone()[0])
    conn.close()

if __name__ == '__main__':
    run_seed()
