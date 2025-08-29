// Simple script to create dummy data via API calls
// Run this in browser console or as a Node.js script

const API_BASE = 'https://kwcow8kok4s448sw4s8wo8cc.5.78.137.10.sslip.io/api';

async function createDummyData() {
    console.log('🚀 Creating dummy data for dashboard testing...');
    
    // First, let's try to create a test user (this might fail if user exists)
    console.log('👤 Creating test user...');
    
    try {
        const signupResponse = await fetch(`${API_BASE}/signup/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@test.com',
                password: 'testpass123',
                first_name: 'Test',
                last_name: 'User'
            })
        });
        
        if (signupResponse.ok) {
            console.log('✅ Test user created successfully!');
        } else {
            console.log('⚠️ Test user might already exist');
        }
    } catch (error) {
        console.log('⚠️ User creation failed, might already exist');
    }
    
    // Now login with the test user to get auth token
    console.log('🔑 Logging in to get auth token...');
    
    const loginResponse = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'test@test.com',
            password: 'testpass123'
        })
    });
    
    if (!loginResponse.ok) {
        console.error('❌ Login failed. Please check credentials or create user manually.');
        return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful!');
    
    // Get user's assigned projects
    console.log('📊 Getting assigned projects...');
    
    const projectsResponse = await fetch(`${API_BASE}/projects/`, {
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!projectsResponse.ok) {
        console.error('❌ Failed to get projects');
        return;
    }
    
    const projects = await projectsResponse.json();
    console.log(`✅ Found ${projects.length} projects`);
    
    if (projects.length === 0) {
        console.log('⚠️ No projects assigned to user. Please assign projects first.');
        return;
    }
    
    // Create time entries for the last 30 days
    console.log('⏰ Creating time entries...');
    
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    let entriesCreated = 0;
    
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const currentDate = new Date(d);
        
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            continue;
        }
        
        // 80% chance of working on any given weekday
        if (Math.random() < 0.8) {
            // Pick a random project
            const project = projects[Math.floor(Math.random() * projects.length)];
            
            // Random hours between 2-8, in 0.25 increments
            const hours = Math.round((Math.random() * 6 + 2) * 4) / 4;
            
            const dateString = currentDate.toISOString().split('T')[0];
            
            const notes = [
                `Working on ${project.name} frontend development`,
                `Backend API development for ${project.name}`,
                `Testing and debugging ${project.name}`,
                `Code review and documentation for ${project.name}`,
                `UI/UX improvements for ${project.name}`,
                `Bug fixes and maintenance for ${project.name}`
            ];
            
            const note = notes[Math.floor(Math.random() * notes.length)];
            
            try {
                const entryResponse = await fetch(`${API_BASE}/time-entries/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        project: project.id,
                        date: dateString,
                        hours: hours,
                        note: note
                    })
                });
                
                if (entryResponse.ok) {
                    entriesCreated++;
                    if (entriesCreated % 5 === 0) {
                        console.log(`📝 Created ${entriesCreated} entries...`);
                    }
                }
            } catch (error) {
                console.log(`⚠️ Failed to create entry for ${dateString}`);
            }
        }
    }
    
    console.log(`✅ Created ${entriesCreated} time entries successfully!`);
    console.log('');
    console.log('🎉 Dummy data creation completed!');
    console.log('');
    console.log('🔑 Test Login Credentials:');
    console.log('Email: test@test.com');
    console.log('Password: testpass123');
    console.log('');
    console.log('🎯 Now you can:');
    console.log('1. Login with the test credentials');
    console.log('2. Visit the dashboard (home page)');
    console.log('3. See beautiful charts and stats!');
}

// If running in browser console
if (typeof window !== 'undefined') {
    console.log('🌐 Run createDummyData() to start');
    window.createDummyData = createDummyData;
} else {
    // If running as Node.js script
    createDummyData().catch(console.error);
}
