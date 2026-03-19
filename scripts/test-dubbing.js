/**
 * Quick test script to verify AI dubbing system is working
 * Run: node scripts/test-dubbing.js
 */

async function testDubbingSystem() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  console.log('\n🎬 Testing Ukrainian Dubbing AI System\n');
  console.log(`Base URL: ${baseUrl}\n`);

  try {
    // Test 1: Check if API is reachable
    console.log('📌 Test 1: Checking API availability...');
    const healthCheck = await fetch(`${baseUrl}/api/movies-with-dubbing`, {
      method: 'GET',
    });
    
    if (healthCheck.ok) {
      console.log('✅ API is reachable\n');
    } else {
      console.log('❌ API returned status:', healthCheck.status, '\n');
      return;
    }

    // Test 2: Search for dubbing for a test movie
    console.log('📌 Test 2: Testing dubbing search for "Avengers"...');
    const searchResponse = await fetch(`${baseUrl}/api/ai-dubbing-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId: 24428,
        title: 'Avengers',
        forceRefresh: false,
      }),
    });

    if (searchResponse.ok) {
      const result = await searchResponse.json();
      if (result.data) {
        console.log('✅ Dubbing found:');
        console.log(`   - Title UK: ${result.data.title_uk}`);
        console.log(`   - Studio: ${result.data.studio}`);
        console.log(`   - Quality: ${result.data.quality}`);
        console.log(`   - Subtitles: ${result.data.has_subtitles ? 'Yes' : 'No'}`);
      } else if (result.cached) {
        console.log('✅ Dubbing cached (already exists)');
      }
      console.log('');
    } else {
      const error = await searchResponse.json();
      console.log('⚠️  Search returned:', error.error || 'Unknown error', '\n');
    }

    // Test 3: Get all movies with dubbing
    console.log('📌 Test 3: Fetching all movies with dubbing...');
    const moviesResponse = await fetch(`${baseUrl}/api/movies-with-dubbing`);
    
    if (moviesResponse.ok) {
      const { movies } = await moviesResponse.json();
      console.log(`✅ Retrieved ${movies?.length || 0} movies`);
      if (movies && movies.length > 0) {
        console.log(`   First movie: ${movies[0].title} (${movies[0].year})`);
        if (movies[0].dubbing_info) {
          console.log(`   Has dubbing: ${movies[0].dubbing_info.title_uk}`);
        }
      }
      console.log('');
    } else {
      console.log('❌ Failed to fetch movies\n');
    }

    // Test 4: Trigger auto-search cron
    console.log('📌 Test 4: Testing auto-search cron job...');
    const cronResponse = await fetch(`${baseUrl}/api/cron/auto-search-dubbing`);
    
    if (cronResponse.ok) {
      const cronResult = await cronResponse.json();
      console.log('✅ Cron job executed:');
      console.log(`   - Processed: ${cronResult.processed || 0}`);
      console.log(`   - Successful: ${cronResult.successful || 0}`);
      console.log(`   - Failed: ${cronResult.failed || 0}`);
    } else {
      console.log('⚠️  Cron job returned status:', cronResponse.status);
    }

    console.log('\n✨ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. The app is running (npm run dev)');
    console.log('2. Supabase is configured in .env.local');
    console.log('3. Database tables are created');
  }
}

// Run tests
testDubbingSystem();
