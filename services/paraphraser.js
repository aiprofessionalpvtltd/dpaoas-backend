// services/paraphraser.js
const axios = require('axios');
const querystring = require('querystring');

/**
 * Paraphrases text using free public APIs
 * @param {string} text - Original text to paraphrase
 * @returns {Promise<string[]>} - Array of paraphrased versions
 */
async function paraphraseText(text) {
  try {
    // Get the first paraphrase from RapidAPI
    const firstParaphrase = await getParaphraseFromAPI(text, 3); // moderate strength
    
    // Create variations of the paraphrase
    const variations = createVariations(text, firstParaphrase);
    
    // Make sure we have at least 3 options
    if (variations.length < 3) {
      // Add some basic paraphrasing if needed
      while (variations.length < 3) {
        variations.push(generateAdditionalParaphrase(text, variations.length));
      }
    }
    
    return variations.slice(0, 3); // Return exactly 3 options
  } catch (error) {
    console.error('Error in paraphrasing:', error.message);
    // Fallback to basic paraphrasing
    return [
      basicParaphrase(text, 'synonym'),
      basicParaphrase(text, 'structure'),
      basicParaphrase(text, 'style')
    ];
  }
}

/**
 * Get a paraphrase from the RapidAPI endpoint
 */
async function getParaphraseFromAPI(text, strength) {
  try {
    const options = {
      method: 'POST',
      url: 'https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/rewrite',
      headers: {
        'x-rapidapi-host': 'rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com',
        'x-rapidapi-key': 'a26ca3beccmsh86001d01e797b5ap1ae01ejsn14f3a6e6282c',
        'Content-Type': 'application/json'
      },
      data: {
        language: 'en',
        strength: strength,
        text: text
      }
    };
    
    const response = await axios.request(options);
    
    if (response.data && response.data.rewrite) {
      return response.data.rewrite;
    }
    return null;
  } catch (error) {
    console.error('Error with RapidAPI:', error.message);
    return null;
  }
}

/**
 * Create variations from original text and API response
 */
function createVariations(originalText, apiParaphrase) {
  const variations = [];
  
  // Add the API response if valid
  if (apiParaphrase && apiParaphrase !== originalText) {
    variations.push(apiParaphrase);
  }
  
  // Create a synonym-based variation
  const synonymVariation = synonymReplacement(originalText);
  if (synonymVariation !== originalText && !variations.includes(synonymVariation)) {
    variations.push(synonymVariation);
  }
  
  // Create a structure-based variation
  const structureVariation = sentenceStructureChange(originalText);
  if (structureVariation !== originalText && !variations.includes(structureVariation)) {
    variations.push(structureVariation);
  }
  
  // Create a style variation
  const styleVariation = styleTransformation(originalText);
  if (styleVariation !== originalText && !variations.includes(styleVariation)) {
    variations.push(styleVariation);
  }
  
  return variations;
}

/**
 * Generate additional paraphrases when needed
 */
function generateAdditionalParaphrase(text, index) {
  // Create different types of variations based on the index
  switch (index % 3) {
    case 0:
      return addIntroductoryPhrase(text);
    case 1:
      return restructureSentence(text);
    case 2:
      return changeWordOrder(text);
    default:
      return text;
  }
}

/**
 * Add introductory phrases
 */
function addIntroductoryPhrase(text) {
  const phrases = [
    "In other words, ",
    "To put it differently, ",
    "Alternatively speaking, ",
    "Another way to express this is that ",
    "To rephrase, ",
    "It could be said that ",
    "To state it differently, "
  ];
  
  const phrase = phrases[Math.floor(Math.random() * phrases.length)];
  return phrase + text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Basic restructuring of sentences
 */
function restructureSentence(text) {
  // Split text into sentences
  const sentences = text.split(/[.!?]+\s*/);
  
  if (sentences.length > 1) {
    // Rearrange sentence order for multi-sentence text
    return sentences.reverse().join(". ") + ".";
  } else {
    // For single sentences, try to split at commas or conjunctions
    const parts = text.split(/,|\sand\s|\sor\s|\sbut\s|\sbecause\s/);
    if (parts.length > 1) {
      return parts.reverse().join(", ") + ".";
    }
  }
  
  // If no good splitting point, add a conclusion
  return text + " In essence, this is the main point.";
}

/**
 * Change word order in the sentence
 */
function changeWordOrder(text) {
  // This is a simple transformation that moves adjectives
  return text.replace(/(\w+) (\w+) (\w+)/, "$3 $1 $2");
}

/**
 * Change the style of writing
 */
function styleTransformation(text) {
  // Make it more formal
  let result = text
    .replace(/don't/g, "do not")
    .replace(/can't/g, "cannot")
    .replace(/won't/g, "will not")
    .replace(/I'm/g, "I am")
    .replace(/you're/g, "you are")
    .replace(/they're/g, "they are")
    .replace(/we're/g, "we are")
    .replace(/isn't/g, "is not")
    .replace(/aren't/g, "are not");
  
  // Add some academic/formal phrases
  const formalPhrases = [
    "It is evident that ",
    "It should be noted that ",
    "It is worth considering that ",
    "Upon analysis, ",
    "From an objective standpoint, "
  ];
  
  // 50% chance to add a formal phrase at the beginning
  if (Math.random() > 0.5) {
    const phrase = formalPhrases[Math.floor(Math.random() * formalPhrases.length)];
    result = phrase + result.charAt(0).toLowerCase() + result.slice(1);
  }
  
  return result;
}

/**
 * Basic paraphrase methods
 */
function basicParaphrase(text, method) {
  switch (method) {
    case 'synonym':
      return synonymReplacement(text);
    case 'structure':
      return sentenceStructureChange(text);
    case 'style':
      return styleTransformation(text);
    default:
      return text;
  }
}

/**
 * Replace common words with synonyms
 */
function synonymReplacement(text) {
  const synonymMap = {
    'good': ['excellent', 'fine', 'great', 'positive', 'satisfactory'],
    'bad': ['poor', 'inadequate', 'substandard', 'negative', 'unsatisfactory'],
    'big': ['large', 'substantial', 'considerable', 'significant', 'extensive'],
    'small': ['tiny', 'little', 'minor', 'miniature', 'modest'],
    'important': ['significant', 'crucial', 'essential', 'vital', 'critical'],
    'use': ['utilize', 'employ', 'apply', 'leverage', 'implement'],
    'make': ['create', 'produce', 'generate', 'form', 'construct'],
    'get': ['obtain', 'acquire', 'gain', 'secure', 'procure'],
    'show': ['display', 'exhibit', 'demonstrate', 'present', 'reveal'],
    'tell': ['inform', 'notify', 'advise', 'relate', 'communicate'],
    'sample': ['example', 'instance', 'illustration', 'model', 'specimen'],
    'paragraph': ['passage', 'text', 'section', 'excerpt', 'content'],
    'needs': ['requires', 'demands', 'necessitates', 'calls for', 'must have'],
    'paraphrased': ['reworded', 'restated', 'rephrased', 'rewritten', 'reformulated'],
    'this': ['the current', 'the following', 'the present', 'the given', 'the aforementioned'],
    'is': ['exists as', 'serves as', 'functions as', 'acts as', 'represents'],
    'a': ['one', 'a certain', 'a particular', 'some', 'any'],
    'the': ['that', 'this', 'such', 'said', 'those'],
    'to be': ['to become', 'to exist as', 'to function as', 'to serve as', 'to represent']
  };
  
  let result = text;
  
  // Replace words with synonyms
  Object.keys(synonymMap).forEach(word => {
    const synonyms = synonymMap[word];
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    // Only replace the first occurrence to avoid too many changes
    let replaced = false;
    result = result.replace(regex, match => {
      if (!replaced && Math.random() < 0.7) {
        replaced = true;
        // Choose a random synonym
        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)];
        // Match capitalization
        return match[0] === match[0].toUpperCase()
          ? synonym.charAt(0).toUpperCase() + synonym.slice(1)
          : synonym;
      }
      return match;
    });
  });
  
  return result;
}

/**
 * Change sentence structure by rearranging parts
 */
function sentenceStructureChange(text) {
  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Process each sentence separately
  const transformedSentences = sentences.map(sentence => {
    // Identify potential transformations based on sentence structure
    
    // 1. If sentence begins with "This is" change to "Here is"
    if (/^This is /i.test(sentence)) {
      return sentence.replace(/^This is /i, "Here is ");
    }
    
    // 2. Change "X is Y" to "Y is what X is"
    const isPattern = sentence.match(/([^.!?]+) is ([^.!?]+)/i);
    if (isPattern) {
      return `${isPattern[2].trim()} is what ${isPattern[1].toLowerCase().trim()}`;
    }
    
    // 3. Change "X needs Y" to "Y is needed by X"
    const needsPattern = sentence.match(/([^.!?]+) needs ([^.!?]+)/i);
    if (needsPattern) {
      return `${needsPattern[2].trim()} is needed by ${needsPattern[1].toLowerCase().trim()}`;
    }
    
    // If no patterns match, return the original sentence
    return sentence;
  });
  
  return transformedSentences.join(' ');
}

module.exports = {
  paraphraseText
};