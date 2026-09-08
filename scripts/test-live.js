async function checkLive() {
  try {
    const res = await fetch('https://supremeadventureske.com/');
    const text = await res.text();
    const ogTags = text.match(/<meta[^>]+(?:og:|twitter:)[^>]+>/gi);
    console.log('--- LIVE META TAGS ---');
    console.log(ogTags ? ogTags.join('\n') : 'No OG tags found');

    const imgRes = await fetch('https://supremeadventureske.com/og-image.jpg');
    console.log('\n--- LIVE OG IMAGE CHECK ---');
    console.log('HTTP Status for /og-image.jpg:', imgRes.status);
    console.log('Content-Type:', imgRes.headers.get('content-type'));

    const pngRes = await fetch('https://supremeadventureske.com/og-image.png');
    console.log('HTTP Status for /og-image.png:', pngRes.status);

    const logoRes = await fetch('https://supremeadventureske.com/supreme-official-logo.png');
    console.log('HTTP Status for /supreme-official-logo.png:', logoRes.status);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

checkLive();
