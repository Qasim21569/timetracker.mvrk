"""
Comprehensive Test Suite for Cycle 2: Project Assignment System
Tests all assignment functionality including service layer and API endpoints
"""

import json
import requests
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"

class TestCycle2Assignments:
    def __init__(self):
        self.admin_token = None
        self.user_token = None
        self.created_project_id = None
        self.created_user_id = None
        
    def run_all_tests(self):
        """Run all Cycle 2 tests in sequence"""
        print("🚀 CYCLE 2 TEST SUITE: Project Assignment System")
        print("=" * 60)
        
        try:
            # Setup phase
            self.test_setup()
            
            # Core assignment tests
            self.test_project_creation_with_client()
            self.test_assign_users_to_project()
            self.test_get_project_assignments()
            self.test_get_user_projects()
            self.test_unassign_users_from_project()
            
            # Permission tests
            self.test_non_admin_assignment_denied()
            
            # Error handling tests
            self.test_invalid_project_assignment()
            self.test_invalid_user_assignment()
            
            # Statistics tests
            self.test_assignment_statistics()
            
            # Integration tests
            self.test_project_list_includes_assignments()
            
            print("\n✅ ALL CYCLE 2 TESTS PASSED!")
            print("🎉 Project Assignment System is working correctly!")
            
        except Exception as e:
            print(f"\n❌ TEST FAILED: {e}")
            raise
    
    def test_setup(self):
        """Setup test environment"""
        print("\n📋 Test Setup...")
        
        # Login as admin
        admin_response = requests.post(f"{BASE_URL}/login/", json={
            "username": "admin",
            "password": "admin123"
        })
        assert admin_response.status_code == 200, f"Admin login failed: {admin_response.text}"
        self.admin_token = admin_response.json()["token"]
        print("✅ Admin authentication successful")
        
        # Create a test user with timestamp to ensure uniqueness
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        user_data = {
            "username": f"testuser_cycle2_{timestamp}",
            "email": f"testuser_cycle2_{timestamp}@example.com",
            "first_name": "Test",
            "last_name": "User Cycle2",
            "password": "testpass123",
            "password_confirm": "testpass123"
        }
        
        user_response = requests.post(f"{BASE_URL}/users/", 
            json=user_data,
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        assert user_response.status_code == 201, f"User creation failed: {user_response.text}"
        self.created_user_id = user_response.json()["id"]
        print(f"✅ Test user created with ID: {self.created_user_id}")
        
        # Login as the test user
        user_login_response = requests.post(f"{BASE_URL}/login/", json={
            "username": f"testuser_cycle2_{timestamp}",
            "password": "testpass123"
        })
        assert user_login_response.status_code == 200, f"User login failed: {user_login_response.text}"
        self.user_token = user_login_response.json()["token"]
        print("✅ Test user authentication successful")
    
    def test_project_creation_with_client(self):
        """Test creating project with client field"""
        print("\n🏗️ Testing Project Creation with Client Field...")
        
        project_data = {
            "name": "Cycle 2 Test Project",
            "client": "MVRK Dev Client"
        }
        
        response = requests.post(f"{BASE_URL}/projects/", 
            json=project_data,
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 201, f"Project creation failed: {response.text}"
        project = response.json()
        
        self.created_project_id = project["id"]
        assert project["name"] == "Cycle 2 Test Project"
        assert project["client"] == "MVRK Dev Client"
        assert "assigned_user_ids" in project
        assert project["assigned_user_ids"] == []  # No assignments initially
        
        print(f"✅ Project created successfully with ID: {self.created_project_id}")
        print(f"   Project has client field: {project['client']}")
        print(f"   Initial assigned_user_ids: {project['assigned_user_ids']}")
    
    def test_assign_users_to_project(self):
        """Test assigning users to a project"""
        print("\n👥 Testing User Assignment to Project...")
        
        assignment_data = {
            "user_ids": [self.created_user_id],
            "notes": "Test assignment for Cycle 2"
        }
        
        response = requests.post(f"{BASE_URL}/projects/{self.created_project_id}/assign/",
            json=assignment_data,
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 200, f"User assignment failed: {response.text}"
        result = response.json()
        
        assert result["success"] is True
        assert "Assignment operation completed" in result["message"]
        assert len(result["data"]["assigned"]) == 1
        assert result["data"]["assigned"][0]["user_id"] == self.created_user_id
        assert len(result["data"]["already_assigned"]) == 0
        assert len(result["data"]["errors"]) == 0
        
        print(f"✅ User assignment successful")
        print(f"   Assigned users: {len(result['data']['assigned'])}")
        print(f"   Assignment notes: Test assignment for Cycle 2")
    
    def test_get_project_assignments(self):
        """Test retrieving project assignments"""
        print("\n📋 Testing Project Assignment Retrieval...")
        
        response = requests.get(f"{BASE_URL}/projects/{self.created_project_id}/assignments/",
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 200, f"Getting assignments failed: {response.text}"
        result = response.json()
        
        assert result["success"] is True
        assignments = result["data"]
        assert len(assignments) == 1
        
        assignment = assignments[0]
        assert assignment["user"]["id"] == self.created_user_id
        # Don't check exact username since it's timestamped
        assert assignment["is_active"] is True
        assert "assigned_date" in assignment
        
        print(f"✅ Project assignments retrieved successfully")
        print(f"   Total assignments: {len(assignments)}")
        print(f"   User: {assignment['user']['username']}")
        print(f"   Assignment date: {assignment['assigned_date']}")
    
    def test_get_user_projects(self):
        """Test retrieving user's assigned projects"""
        print("\n📂 Testing User Project Retrieval...")
        
        response = requests.get(f"{BASE_URL}/users/{self.created_user_id}/projects/",
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 200, f"Getting user projects failed: {response.text}"
        result = response.json()
        
        assert result["success"] is True
        projects = result["data"]
        assert len(projects) == 1
        
        project = projects[0]
        assert project["project"]["id"] == self.created_project_id
        assert project["project"]["name"] == "Cycle 2 Test Project"
        assert project["project"]["client"] == "MVRK Dev Client"
        assert project["assignment"]["is_active"] is True
        
        print(f"✅ User projects retrieved successfully")
        print(f"   Total assigned projects: {len(projects)}")
        print(f"   Project: {project['project']['name']}")
        print(f"   Client: {project['project']['client']}")
    
    def test_unassign_users_from_project(self):
        """Test removing users from a project"""
        print("\n🔄 Testing User Unassignment from Project...")
        
        unassignment_data = {
            "user_ids": [self.created_user_id]
        }
        
        response = requests.post(f"{BASE_URL}/projects/{self.created_project_id}/unassign/",
            json=unassignment_data,
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 200, f"User unassignment failed: {response.text}"
        result = response.json()
        
        assert result["success"] is True
        assert "Unassignment operation completed" in result["message"]
        assert len(result["data"]["unassigned"]) == 1
        assert result["data"]["unassigned"][0]["user_id"] == self.created_user_id
        
        print(f"✅ User unassignment successful")
        print(f"   Unassigned users: {len(result['data']['unassigned'])}")
        
        # Verify assignment is inactive
        assignments_response = requests.get(f"{BASE_URL}/projects/{self.created_project_id}/assignments/",
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        assignments = assignments_response.json()["data"]
        assert len(assignments) == 0  # Should be 0 active assignments
        
        # Test with include_inactive=true
        inactive_response = requests.get(f"{BASE_URL}/projects/{self.created_project_id}/assignments/?include_inactive=true",
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        inactive_assignments = inactive_response.json()["data"]
        assert len(inactive_assignments) == 1
        assert inactive_assignments[0]["is_active"] is False
        
        print(f"   Verified assignment is now inactive")
    
    def test_non_admin_assignment_denied(self):
        """Test that non-admin users cannot assign projects"""
        print("\n🔒 Testing Non-Admin Permission Restrictions...")
        
        assignment_data = {
            "user_ids": [self.created_user_id]
        }
        
        response = requests.post(f"{BASE_URL}/projects/{self.created_project_id}/assign/",
            json=assignment_data,
            headers={"Authorization": f"Token {self.user_token}"}
        )
        
        assert response.status_code == 403, f"Expected 403 Forbidden, got {response.status_code}"
        
        print(f"✅ Non-admin assignment correctly denied (403 Forbidden)")
    
    def test_invalid_project_assignment(self):
        """Test assignment to non-existent project"""
        print("\n❌ Testing Invalid Project Assignment...")
        
        assignment_data = {
            "user_ids": [self.created_user_id]
        }
        
        response = requests.post(f"{BASE_URL}/projects/99999/assign/",
            json=assignment_data,
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400 Bad Request, got {response.status_code}"
        result = response.json()
        assert result["success"] is False
        assert "does not exist" in result["error"]
        
        print(f"✅ Invalid project assignment correctly handled")
    
    def test_invalid_user_assignment(self):
        """Test assignment of non-existent user"""
        print("\n❌ Testing Invalid User Assignment...")
        
        assignment_data = {
            "user_ids": [99999]  # Non-existent user ID
        }
        
        response = requests.post(f"{BASE_URL}/projects/{self.created_project_id}/assign/",
            json=assignment_data,
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 400, f"Expected 400 Bad Request, got {response.status_code}"
        result = response.json()
        # The serializer validation error might be in different format
        if "success" in result:
            assert result["success"] is False
            assert "Invalid user IDs" in result["error"]
        else:
            # Serializer validation error format
            assert "user_ids" in result  # ValidationError from serializer
        
        print(f"✅ Invalid user assignment correctly handled")
    
    def test_assignment_statistics(self):
        """Test assignment statistics endpoint"""
        print("\n📊 Testing Assignment Statistics...")
        
        response = requests.get(f"{BASE_URL}/assignments/stats/",
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 200, f"Getting stats failed: {response.text}"
        result = response.json()
        
        assert result["success"] is True
        stats = result["data"]
        
        assert "total_assignments" in stats
        assert "total_projects" in stats
        assert "total_users" in stats
        assert "unassigned_projects" in stats
        assert "unassigned_users" in stats
        assert "assignment_coverage" in stats
        
        print(f"✅ Assignment statistics retrieved successfully")
        print(f"   Total projects: {stats['total_projects']}")
        print(f"   Total users: {stats['total_users']}")
        print(f"   Active assignments: {stats['total_assignments']}")
        print(f"   Project coverage: {stats['assignment_coverage']['projects']}%")
        print(f"   User coverage: {stats['assignment_coverage']['users']}%")
    
    def test_project_list_includes_assignments(self):
        """Test that project list includes assignment information"""
        print("\n🔗 Testing Project List with Assignment Data...")
        
        response = requests.get(f"{BASE_URL}/projects/",
            headers={"Authorization": f"Token {self.admin_token}"}
        )
        
        assert response.status_code == 200, f"Getting projects failed: {response.text}"
        projects = response.json()
        
        # Find our test project
        test_project = None
        for project in projects:
            if project["id"] == self.created_project_id:
                test_project = project
                break
        
        assert test_project is not None, "Test project not found in project list"
        assert "assigned_user_ids" in test_project
        assert "assigned_users" in test_project
        assert "client" in test_project
        assert test_project["client"] == "MVRK Dev Client"
        
        print(f"✅ Project list includes assignment data")
        print(f"   Project has assigned_user_ids field: {test_project['assigned_user_ids']}")
        print(f"   Project has assigned_users field: {len(test_project['assigned_users'])} users")
        print(f"   Project has client field: {test_project['client']}")


def main():
    """Run the test suite"""
    tester = TestCycle2Assignments()
    tester.run_all_tests()


if __name__ == "__main__":
    main() 