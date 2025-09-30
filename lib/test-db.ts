import { supabase } from './supabase';

export async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('centers')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('Health check failed:', healthError);
      return false;
    }
    console.log('✓ Basic connection successful');

    // Test 2: Check students table structure
    console.log('2. Testing students table structure...');
    const { data: studentsStructure, error: structureError } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('Students table structure error:', structureError);
      console.error('Error details:', {
        message: structureError.message,
        details: structureError.details,
        hint: structureError.hint,
        code: structureError.code
      });
      return false;
    }
    console.log('✓ Students table accessible');
    console.log('Sample student record:', studentsStructure?.[0]);

    // Test 3: Check if we can query with ordering
    console.log('3. Testing students query with ordering...');
    const { data: orderedStudents, error: orderError } = await supabase
      .from('students')
      .select('id, full_name')
      .order('full_name')
      .limit(5);
    
    if (orderError) {
      console.error('Students ordering error:', orderError);
      console.error('Error details:', {
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
        code: orderError.code
      });
      return false;
    }
    console.log('✓ Students ordering successful');
    console.log('Ordered students:', orderedStudents);

    // Test 4: Check other tables
    console.log('4. Testing other tables...');
    const { data: centers, error: centersError } = await supabase
      .from('centers')
      .select('*')
      .limit(1);
    
    if (centersError) {
      console.error('Centers table error:', centersError);
    } else {
      console.log('✓ Centers table accessible');
    }

    console.log('Database connection tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

export async function checkTableColumns() {
  console.log('Checking table columns...');
  
  try {
    // This will help us see what columns actually exist
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error checking columns:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log('Available columns in students table:', Object.keys(data[0]));
      return Object.keys(data[0]);
    } else {
      console.log('No data in students table to check columns');
      return [];
    }
  } catch (error) {
    console.error('Failed to check table columns:', error);
    return null;
  }
} 