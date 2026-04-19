##Introduction##
Although 1-2% of adults have OCD (estimated 8 million in the US), it is a very misunderstood disease. At its core, OCD is when someone's brain excessively prioritizes intrusive thoughts (obsessions), and they begin performing ritualistic, irrational behaviors (compulsions) to ease them. OCD comes in many different forms, but performing compulsions always makes OCD worse, even if they provide short-term relief. A relevant hypothetical example:

John has health anxiety OCD: he has an intense fear of contracting a life-threatening disease. Because of this, he is hyper aware of his body and frequently believes he is displaying symptoms of a severe illness. To comfort himself, he googles the symptoms of that illness, or seeks reassurance from his family. This further reinforces John's belief that he is in real danger, and he spends more and more of his time examining symptoms that do not exist.

Without intervention, less than 20% of people can recover from OCD by themselves. ERP (Exposure and Response Prevention) therapy is the gold standard for OCD treatment. To break the pattern, patients are exposed to their obsessions and must stop themselves from performing compulsions.

##What it does##
Oftentimes, OCD patients are not fully aware of all of their obsessions, or are deeply ashamed of describing them with language, so logging obsessions is an important first step in ERP. I built a browser extension that acts as an obsession log, and uses NLP to prevent the user from using the internet to seek reassurance for their obsessions.

Seeking excessive certainty is a common theme in OCD. To address this, the extension uses a small transformer model to perform local semantic analysis on the user's obsessions, and blocks any internet searches that are intended to gain certainty about their obsession. This forces the user to live with discomfort and uncertainty. Privacy, speed, and convenience were top priorities.

##Method##
ManifestV3 extension, Chrome Extensions API, React popup UI, compromise.js: lightweight NLP for tokenization and part of speech extraction, Xenova/nli-deberta-v3-small: zero-shot classification.

Nouns are extracted from obsessions, and zero shot classification is performed between every search query and each compulsion, with the framing "I am looking for information about..." If the search and the compulsion entail each other, the search is blocked.

##Use##
in chrome://extensions/ select load unpacked, then select /dist
