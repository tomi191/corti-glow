const fs = require('fs');
const path = require('path');

const OPENROUTER_API_KEY = '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';

async function generateImage(prompt, referenceImagePath, outputName) {
  console.log(`\n=== Generating: ${outputName} ===`);
  console.log(`Reference: ${referenceImagePath}`);
  console.log(`Prompt: ${prompt.substring(0, 100)}...`);

  // Read and encode reference image
  const imagePath = path.join(__dirname, '..', 'public', 'images', referenceImagePath);
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = referenceImagePath.endsWith('.webp') ? 'image/webp' : 'image/png';

  console.log(`Image size: ${(imageBuffer.length / 1024).toFixed(1)} KB`);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://luralab.com',
      'X-Title': 'LuraLab Image Generation'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash-image',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ],
      max_tokens: 4096
    })
  });

  const data = await response.json();
  console.log('API Response:', JSON.stringify(data, null, 2));

  // Check if there's an image in the response
  if (data.choices && data.choices[0]?.message?.content) {
    const content = data.choices[0].message.content;
    console.log('Content type:', typeof content);

    // If content contains base64 image data, save it
    if (typeof content === 'string' && content.includes('base64')) {
      const base64Match = content.match(/data:image\/[^;]+;base64,([^"'\s]+)/);
      if (base64Match) {
        const outputPath = path.join(__dirname, '..', 'public', 'images', `${outputName}.webp`);
        fs.writeFileSync(outputPath, Buffer.from(base64Match[1], 'base64'));
        console.log(`Saved to: ${outputPath}`);
      }
    }
  }

  return data;
}

// Run generation
async function main() {
  try {
    await generateImage(
      'Generate a new premium product photo in the exact same style as this reference image. Create a beautiful flatlay showing: multiple pink Corti-Glow supplement sachets arranged artistically, fresh strawberries and lime wedges, pink powder scattered on white marble surface, soft natural lighting, luxury wellness aesthetic, professional product photography.',
      'product-sachet-marble.webp',
      'product-multiple-sachets'
    );
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
