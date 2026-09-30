# -*- coding: utf-8 -*-
import os

gandhi_quotes = [
    # Section 1: Truth & Non-Violence (Satya & Ahimsa)
    {
        "cat": "truth-nonviolence",
        "text": "An eye for an eye only ends up making the whole world blind.",
        "tags": ["Non-Violence", "Peace", "Justice"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Truth is the greatest weapon against untruth. Non-violence is the greatest weapon against violence.",
        "tags": ["Truth", "Ahimsa", "Wisdom"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Non-violence is the greatest force at the disposal of mankind. It is mightier than the mightiest weapon of destruction devised by the ingenuity of man.",
        "tags": ["Ahimsa", "Strength", "Humanity"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Truth resides in every human heart, and one has to search for it there, and to be guided by truth as one sees it.",
        "tags": ["Truth", "Heart", "Integrity"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "A 'No' uttered from the deepest conviction is better than a 'Yes' merely uttered to please, or worse, to avoid trouble.",
        "tags": ["Conviction", "Honesty", "Courage"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Morality is the basis of things, and truth is the substance of all morality.",
        "tags": ["Morality", "Truth", "Character"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "The weak can never forgive. Forgiveness is the attribute of the strong.",
        "tags": ["Forgiveness", "Strength", "Courage"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Truth never damages a cause that is just.",
        "tags": ["Justice", "Truth", "Faith"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Even if you are a minority of one, the truth is the truth.",
        "tags": ["Individuality", "Truth", "Stand Alone"]
    },
    {
        "cat": "truth-nonviolence",
        "text": "Non-violence requires a double faith: faith in God and also faith in man.",
        "tags": ["Faith", "Ahimsa", "Spiritual"]
    },

    # Section 2: Peace & Inner Harmony
    {
        "cat": "peace-harmony",
        "text": "There is no way to peace; peace is the way.",
        "tags": ["Peace", "Way of Life", "Harmony"]
    },
    {
        "cat": "peace-harmony",
        "text": "I will not let anyone walk through my mind with their dirty feet.",
        "tags": ["Mental Peace", "Boundaries", "Mindfulness"]
    },
    {
        "cat": "peace-harmony",
        "text": "Happiness is when what you think, what you say, and what you do are in harmony.",
        "tags": ["Happiness", "Harmony", "Authenticity"]
    },
    {
        "cat": "peace-harmony",
        "text": "Each one has to find his peace from within. And peace to be real must be unaffected by outside circumstances.",
        "tags": ["Inner Peace", "Resilience", "Mind"]
    },
    {
        "cat": "peace-harmony",
        "text": "In a gentle way, you can shake the world.",
        "tags": ["Gentleness", "Impact", "Inspiration"]
    },
    {
        "cat": "peace-harmony",
        "text": "Peace between countries must underpin peace within communities, and peace within communities must start with peace within the individual.",
        "tags": ["Global Peace", "Unity", "Self"]
    },
    {
        "cat": "peace-harmony",
        "text": "Nobody can hurt me without my permission.",
        "tags": ["Self Worth", "Strength", "Inner Strength"]
    },
    {
        "cat": "peace-harmony",
        "text": "Silence is the best answer to anger.",
        "tags": ["Silence", "Patience", "Calm"]
    },
    {
        "cat": "peace-harmony",
        "text": "The day the power of love overrules the love of power, the world will know peace.",
        "tags": ["Love", "Power", "World Peace"]
    },
    {
        "cat": "peace-harmony",
        "text": "To give pleasure to a single heart by a single act is better than a thousand heads bowing in prayer.",
        "tags": ["Kindness", "Compassion", "Service"]
    },

    # Section 3: Leadership, Change & Freedom
    {
        "cat": "leadership-change",
        "text": "Be the change that you wish to see in the world.",
        "tags": ["Change", "Action", "Leadership"]
    },
    {
        "cat": "leadership-change",
        "text": "First they ignore you, then they laugh at you, then they fight you, then you win.",
        "tags": ["Perseverance", "Victory", "Courage"]
    },
    {
        "cat": "leadership-change",
        "text": "The future depends on what you do today.",
        "tags": ["Future", "Action", "Discipline"]
    },
    {
        "cat": "leadership-change",
        "text": "It is health that is real wealth and not pieces of gold and silver.",
        "tags": ["Health", "Wealth", "Life Values"]
    },
    {
        "cat": "leadership-change",
        "text": "Strength does not come from physical capacity. It comes from an indomitable will.",
        "tags": ["Willpower", "Inner Strength", "Courage"]
    },
    {
        "cat": "leadership-change",
        "text": "A small body of determined spirits fired by an unquenchable faith in their mission can alter the course of history.",
        "tags": ["Determination", "History", "Faith"]
    },
    {
        "cat": "leadership-change",
        "text": "Freedom is not worth having if it does not include the freedom to make mistakes.",
        "tags": ["Freedom", "Growth", "Learning"]
    },
    {
        "cat": "leadership-change",
        "text": "I suppose leadership at one time meant muscles; but today it means getting along with people.",
        "tags": ["Leadership", "Empathy", "Teamwork"]
    },
    {
        "cat": "leadership-change",
        "text": "You may never know what results come of your actions, but if you do nothing, there will be no results.",
        "tags": ["Action", "Effort", "Initiative"]
    },
    {
        "cat": "leadership-change",
        "text": "Action expresses priorities.",
        "tags": ["Focus", "Time", "Productivity"]
    },

    # Section 4: Cleanliness (Swachhata) & Simplicity
    {
        "cat": "simplicity-cleanliness",
        "text": "Cleanliness is next to godliness.",
        "tags": ["Cleanliness", "Swachh Bharat", "Purity"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "Sanitation is more important than independence.",
        "tags": ["Sanitation", "Health", "Social Reform"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "The earth has enough resources for everyone's need, but not enough for anyone's greed.",
        "tags": ["Environment", "Simplicity", "Nature"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "Live simply so that others may simply live.",
        "tags": ["Simplicity", "Generosity", "Minimalism"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "So long as you do not take the broom and the bucket in your hands, you cannot make your towns and cities clean.",
        "tags": ["Civic Duty", "Cleanliness", "Self Reliance"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "A man is but the product of his thoughts. What he thinks, he becomes.",
        "tags": ["Mindset", "Thought", "Self Growth"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "Our greatest ability as humans is not to change the world; but to change ourselves.",
        "tags": ["Self Improvement", "Transformation", "Wisdom"]
    },
    {
        "cat": "simplicity-cleanliness",
        "text": "There is more to life than simply increasing its speed.",
        "tags": ["Slow Living", "Mindfulness", "Life Lessons"]
    },

    # Section 5: Short Status for WhatsApp & Instagram
    {
        "cat": "short-status",
        "text": "Live as if you were to die tomorrow. Learn as if you were to live forever.",
        "tags": ["Status", "Learning", "Life"]
    },
    {
        "cat": "short-status",
        "text": "Where there is love, there is life.",
        "tags": ["Love", "Life", "Bio"]
    },
    {
        "cat": "short-status",
        "text": "Hate the sin, love the sinner.",
        "tags": ["Compassion", "Forgiveness", "Wisdom"]
    },
    {
        "cat": "short-status",
        "text": "My life is my message.",
        "tags": ["Purpose", "Legacy", "Inspiration"]
    },
    {
        "cat": "short-status",
        "text": "In doing something, do it with love or never do it at all.",
        "tags": ["Dedication", "Love", "Passion"]
    },
    {
        "cat": "short-status",
        "text": "Glory lies in the attempt to reach one's goal and not in reaching it.",
        "tags": ["Journey", "Effort", "Growth"]
    },
    {
        "cat": "short-status",
        "text": "To lose patience is to lose the battle.",
        "tags": ["Patience", "Calm", "Discipline"]
    },
    {
        "cat": "short-status",
        "text": "Service without humility is selfishness and egotism.",
        "tags": ["Humility", "Service", "Character"]
    },

    # Section 6: Gandhi Jayanti Wishes & Captions (2nd October)
    {
        "cat": "wishes-captions",
        "text": "Wishing you a reflective Gandhi Jayanti! May Bapu's values of truth, peace, and non-violence illuminate your life and path.",
        "tags": ["Wishes", "Gandhi Jayanti", "Greetings"]
    },
    {
        "cat": "wishes-captions",
        "text": "Remembering the Father of the Nation on his birth anniversary. Let us pledge to be the change we want to see in the world. Happy Gandhi Jayanti 2026!",
        "tags": ["October 2", "Inspiration", "Tribute"]
    },
    {
        "cat": "wishes-captions",
        "text": "A hero is one who stands firm for truth without raising a weapon. Saluting Mahatma Gandhi on Gandhi Jayanti.",
        "tags": ["National Pride", "Ahimsa", "Hero"]
    },
    {
        "cat": "wishes-captions",
        "text": "On this Gandhi Jayanti, let us commit to cleaner streets, kinder hearts, and stronger minds. Happy 2nd October!",
        "tags": ["Swachhata", "Kindness", "Nation"]
    },
    {
        "cat": "wishes-captions",
        "text": "Truth is one, paths are many. Happy International Day of Non-Violence & Gandhi Jayanti.",
        "tags": ["Non-Violence Day", "Global Peace", "Unity"]
    },
    {
        "cat": "wishes-captions",
        "text": "May the spirit of Mahatma Gandhi inspire us toward greater empathy, unity, and courage every day. Warm Gandhi Jayanti wishes to all.",
        "tags": ["Empathy", "Unity", "Celebration"]
    }
]

# Section headers
sections = [
    {
        "id": "truth-nonviolence",
        "name": "Truth & Non-Violence (Satya & Ahimsa)",
        "desc": "Mahatma Gandhi's core philosophy centered on non-violence as the most potent moral force in human history."
    },
    {
        "id": "peace-harmony",
        "name": "Peace & Inner Harmony",
        "desc": "Timeless reflections on mental tranquility, forgiving others, and cultivating calm from within."
    },
    {
        "id": "leadership-change",
        "name": "Leadership, Change & Freedom",
        "desc": "Empowering quotes on taking personal initiative, standing up for justice, and driving societal progress."
    },
    {
        "id": "simplicity-cleanliness",
        "name": "Simplicity, Swachhata & Character",
        "desc": "Gandhi's foundational teachings on clean communities, sustainable living, and moral integrity."
    },
    {
        "id": "short-status",
        "name": "Short Gandhi Quotes for WhatsApp & Instagram",
        "desc": "Bite-sized, punchy quotes ideal for WhatsApp status, Instagram bios, and quick social sharing."
    },
    {
        "id": "wishes-captions",
        "name": "Gandhi Jayanti Wishes & Captions (2nd October)",
        "desc": "Ready-to-share greetings and festive messages to celebrate Bapu's birth anniversary with family and friends."
    }
]

sections_html = []
for sec in sections:
    sec_id = sec["id"]
    sec_name = sec["name"]
    sec_desc = sec["desc"]
    
    sec_quotes = [q for q in gandhi_quotes if q["cat"] == sec_id]
    
    cards_html = []
    for q in sec_quotes:
        escaped_text = q["text"].replace("'", "\\'").replace('"', '&quot;')
        clean_text_for_poster = q["text"].replace('"', '')
        tags_badges = "".join([f'<span class="q-tag">#{t}</span>' for t in q["tags"]])
        
        cards_html.append(f'''        <article class="gandhi-card">
          <div class="card-quote-mark"><i class="fa-solid fa-quote-left"></i></div>
          <p class="gandhi-quote-text">"{q["text"]}"</p>
          <div class="card-bottom">
            <div class="tags-row">{tags_badges}</div>
            <div class="card-actions">
              <button class="action-btn copy-btn" onclick="copyQuote(this, '{escaped_text}')" title="Copy Quote">
                <i class="fa-regular fa-copy"></i>
                <span>Copy</span>
              </button>
              <a href="../poster.html" class="action-btn poster-btn" title="Create Quote Poster">
                <i class="fa-solid fa-palette"></i>
                <span>Poster</span>
              </a>
            </div>
          </div>
        </article>''')
        
    all_cards = "\n".join(cards_html)
    
    sections_html.append(f'''    <section class="topic-section" id="{sec_id}">
      <div class="topic-sec-header">
        <h2 class="topic-sec-title">{sec_name}</h2>
        <p class="topic-sec-desc">{sec_desc}</p>
      </div>
      <div class="gandhi-grid">
{all_cards}
      </div>
    </section>''')

sections_rendered = "\n".join(sections_html)

# Quick Nav TOC pills
toc_pills = "\n".join([f'      <a href="#{s["id"]}" class="toc-chip">{s["name"].split("(")[0].strip()}</a>' for s in sections])

html_page = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9227354288966999" crossorigin="anonymous"></script>
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-P7WSN8P37J"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-P7WSN8P37J');
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=Caveat:wght@600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="../src/css/style.css">

  <link rel="icon" type="image/png" sizes="32x32" href="../data/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../data/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../data/img/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="192x192" href="../data/img/android-chrome-192x192.png">
  <link rel="icon" type="image/png" sizes="512x512" href="../data/img/android-chrome-512x512.png">

  <!-- SEO Metadata -->
  <title>50+ Best Gandhi Jayanti Quotes &amp; Wishes (2026) | Quotebook</title>
  <meta name="description" content="Celebrate Gandhi Jayanti with 50+ inspiring Mahatma Gandhi quotes on peace, truth, and freedom. Copy quotes, read aloud, and make free posters on Quotebook.">
  <meta name="keywords" content="Gandhi Jayanti quotes, Mahatma Gandhi quotes, Gandhi Jayanti wishes, Gandhi thoughts in English, 2 October quotes, non-violence quotes Gandhi, Bapu quotes, Gandhi Jayanti captions for Instagram">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <link rel="canonical" href="https://quotebook.me/quotes/gandhi-jayanti-quotes.html">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="50+ Best Gandhi Jayanti Quotes &amp; Wishes (2026) | Quotebook">
  <meta property="og:description" content="Celebrate Gandhi Jayanti with 50+ inspiring Mahatma Gandhi quotes on peace, truth, and freedom. Copy quotes and design custom posters free on Quotebook.">
  <meta property="og:url" content="https://quotebook.me/quotes/gandhi-jayanti-quotes.html">
  <meta property="og:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="50+ Best Gandhi Jayanti Quotes &amp; Wishes (2026) | Quotebook">
  <meta name="twitter:description" content="Celebrate Gandhi Jayanti with 50+ inspiring Mahatma Gandhi quotes on peace, truth, and freedom.">
  <meta name="twitter:image" content="https://quotebook.me/data/img/og-cover.png">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  [
    {{
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://quotebook.me/" }},
        {{ "@type": "ListItem", "position": 2, "name": "Quotes", "item": "https://quotebook.me/quotes/" }},
        {{ "@type": "ListItem", "position": 3, "name": "Gandhi Jayanti Quotes", "item": "https://quotebook.me/quotes/gandhi-jayanti-quotes.html" }}
      ]
    }},
    {{
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "50+ Best Gandhi Jayanti Quotes & Wishes (2026)",
      "description": "Curated collection of Mahatma Gandhi quotes for Gandhi Jayanti, focusing on peace, truth, ahimsa, and leadership.",
      "url": "https://quotebook.me/quotes/gandhi-jayanti-quotes.html"
    }},
    {{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {{
          "@type": "Question",
          "name": "What is Gandhi Jayanti and why is it celebrated?",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "Gandhi Jayanti is celebrated in India every year on 2nd October to mark the birth anniversary of Mohandas Karamchand Gandhi (Mahatma Gandhi), the leader of the Indian independence movement. Internationally, this day is observed as the International Day of Non-Violence."
          }}
        }},
        {{
          "@type": "Question",
          "name": "What is Mahatma Gandhi's most famous quote?",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "Among Gandhi's most celebrated sayings are: 'Be the change that you wish to see in the world,' 'An eye for an eye only ends up making the whole world blind,' and 'Live as if you were to die tomorrow. Learn as if you were to live forever.'"
          }}
        }},
        {{
          "@type": "Question",
          "name": "Can I make a quote poster for Gandhi Jayanti?",
          "acceptedAnswer": {{
            "@type": "Answer",
            "text": "Yes! You can take any quote from this page and open it in Quotebook's free Poster Studio to download a high-definition 1080×1080 image for WhatsApp status, Instagram stories, or classroom presentations."
          }}
        }}
      ]
    }}
  ]
  </script>

  <style>
    .article-wrap {{ max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; }}
    .article-hero {{ text-align: center; margin-bottom: 3.5rem; }}
    .badge-event {{ display: inline-flex; align-items: center; gap: 0.5rem; background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 0.4rem 1.15rem; border-radius: var(--radius-pill); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1.25rem; }}
    .article-title {{ font-family: var(--font-serif); font-size: clamp(2.2rem, 5.5vw, 3.6rem); color: var(--text-primary); margin-bottom: 1rem; font-weight: 700; line-height: 1.15; }}
    .article-sub {{ font-family: var(--font-sans); color: var(--text-secondary); max-width: 720px; margin: 0 auto 2rem; font-size: 1.15rem; line-height: 1.65; }}

    .quick-toc {{ background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.5rem 1.75rem; margin-bottom: 3.5rem; }}
    .toc-title {{ font-family: var(--font-serif); font-size: 1.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }}
    .toc-grid {{ display: flex; flex-wrap: wrap; gap: 0.6rem; }}
    .toc-chip {{ display: inline-flex; align-items: center; padding: 0.5rem 1rem; background: var(--paper-100); border: 1px solid var(--border-light); border-radius: var(--radius-pill); font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: all var(--transition-fast); }}
    .toc-chip:hover {{ background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); transform: translateY(-2px); }}

    .topic-section {{ margin-bottom: 4rem; scroll-margin-top: 6rem; }}
    .topic-sec-header {{ margin-bottom: 1.75rem; border-left: 4px solid var(--accent-primary); padding-left: 1.25rem; }}
    .topic-sec-title {{ font-family: var(--font-serif); font-size: 1.85rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; }}
    .topic-sec-desc {{ font-family: var(--font-sans); color: var(--text-secondary); font-size: 0.98rem; line-height: 1.5; margin: 0; }}

    .gandhi-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }}
    .gandhi-card {{ background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; gap: 1.25rem; position: relative; transition: transform var(--transition-smooth), box-shadow var(--transition-smooth), border-color var(--transition-smooth); }}
    .gandhi-card:hover {{ transform: translateY(-4px); box-shadow: var(--shadow-md); border-color: var(--accent-primary); }}
    .card-quote-mark {{ font-size: 1.75rem; color: var(--accent-primary); opacity: 0.35; line-height: 1; }}
    .gandhi-quote-text {{ font-family: var(--font-serif); font-size: 1.25rem; line-height: 1.5; color: var(--text-primary); margin: 0; font-style: italic; }}

    .card-bottom {{ display: flex; flex-direction: column; gap: 0.85rem; border-top: 1px solid var(--border-light); pt-3; padding-top: 0.85rem; }}
    .tags-row {{ display: flex; flex-wrap: wrap; gap: 0.4rem; }}
    .q-tag {{ font-size: 0.75rem; color: var(--text-muted); font-weight: 500; background: var(--paper-100); padding: 0.2rem 0.6rem; border-radius: var(--radius-pill); }}
    .card-actions {{ display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem; }}
    .action-btn {{ display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; border-radius: var(--radius-pill); font-size: 0.82rem; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid var(--border-light); background: var(--surface-card); color: var(--text-secondary); transition: all var(--transition-fast); }}
    .action-btn:hover {{ background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }}

    .author-spotlight {{ background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1px solid #fed7aa; border-radius: var(--radius-lg); padding: 2.25rem; margin: 4rem 0; display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }}
    .spotlight-avatar {{ width: 80px; height: 80px; border-radius: 50%; background: #ea580c; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; flex-shrink: 0; }}
    .spotlight-info {{ flex: 1; min-width: 260px; }}
    .spotlight-title {{ font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 0.5rem; color: #7c2d12; font-weight: 700; }}
    .spotlight-text {{ font-size: 0.98rem; color: #9a3412; line-height: 1.6; margin-bottom: 1rem; }}
    .spotlight-link {{ display: inline-flex; align-items: center; gap: 0.5rem; background: #c2410c; color: #fff; font-weight: 600; font-size: 0.9rem; padding: 0.65rem 1.4rem; border-radius: var(--radius-pill); text-decoration: none; transition: transform var(--transition-fast); }}
    .spotlight-link:hover {{ transform: scale(1.04); }}

    .faq-section {{ margin-top: 4.5rem; border-top: 1px solid var(--border-light); padding-top: 3.5rem; }}
    .faq-title {{ font-family: var(--font-serif); font-size: 2.2rem; font-weight: 700; color: var(--text-primary); text-align: center; margin-bottom: 2.5rem; }}
    .faq-item {{ background: var(--surface-card); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.5rem 1.75rem; margin-bottom: 1.25rem; }}
    .faq-question {{ font-family: var(--font-serif); font-size: 1.3rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.6rem; }}
    .faq-answer {{ font-family: var(--font-sans); color: var(--text-secondary); font-size: 1rem; line-height: 1.65; margin: 0; }}

    /* Toast Notification */
    .toast {{ position: fixed; bottom: 2rem; right: 2rem; background: #1e293b; color: #fff; padding: 0.85rem 1.5rem; border-radius: var(--radius-pill); box-shadow: var(--shadow-lg); font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.6rem; z-index: 9999; transform: translateY(100px); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }}
    .toast.show {{ transform: translateY(0); opacity: 1; }}

    @media (max-width: 768px) {{
      .article-wrap {{ padding: 1.5rem 1rem 3.5rem; }}
      .gandhi-grid {{ grid-template-columns: 1fr; }}
      .author-spotlight {{ padding: 1.5rem; flex-direction: column; text-align: center; }}
    }}
  </style>
</head>
<body class="light-theme page-loaded">

  <!-- App Header -->
  <header class="app-header">
    <div class="header-container">
      <a href="/" class="brand-logo" id="brandLogo">
        <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
        <div class="logo-text">
          <span class="logo-title">Quotebook</span>
          <span class="logo-subtitle" id="quoteCountBadge">Timeless Wisdom &amp; Art</span>
        </div>
      </a>
      <div class="header-actions" id="headerActions">
        <a href="/" class="icon-btn-text" title="Go to Home Landing">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="/quotes.html" class="icon-btn-text highlight" title="Explore Quotes">
          <i class="fa-solid fa-compass"></i>
          <span>Explore Quotes</span>
        </a>
      </div>
      <button class="mobile-menu-toggle" id="quotesMenuToggle" aria-label="Open Menu" aria-expanded="false">
        <i class="fa-solid fa-bars-staggered"></i>
      </button>
    </div>
    <nav class="quotes-mobile-drawer" id="quotesMobileDrawer" aria-hidden="true">
      <div class="drawer-inner">
        <a href="/" class="drawer-item">
          <i class="fa-solid fa-house"></i>
          <span>Home</span>
        </a>
        <a href="/quotes.html" class="drawer-item highlight">
          <i class="fa-solid fa-compass"></i>
          <span>Explore 1 Million+ Quotes</span>
        </a>
        <a href="/poster.html" class="drawer-item">
          <i class="fa-solid fa-palette"></i>
          <span>Poster Studio</span>
        </a>
        <a href="/quotes/" class="drawer-item">
          <i class="fa-solid fa-folder-open"></i>
          <span>Categories</span>
        </a>
        <a href="/authors/" class="drawer-item">
          <i class="fa-solid fa-users"></i>
          <span>Authors A–Z</span>
        </a>
      </div>
    </nav>
  </header>

  <main class="article-wrap">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" aria-label="Breadcrumb" style="margin-bottom: 2rem;">
      <a href="/" style="color:var(--text-secondary); text-decoration:none;"><i class="fa-solid fa-house"></i> Home</a>
      <span class="breadcrumb-separator" style="margin: 0 0.5rem; color:var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></span>
      <a href="/quotes/" style="color:var(--text-secondary); text-decoration:none;">Quotes</a>
      <span class="breadcrumb-separator" style="margin: 0 0.5rem; color:var(--text-muted);"><i class="fa-solid fa-chevron-right"></i></span>
      <span class="breadcrumb-current" style="color:var(--text-primary); font-weight:600;">Gandhi Jayanti Quotes</span>
    </nav>

    <!-- Hero Header -->
    <div class="article-hero">
      <div class="badge-event"><i class="fa-solid fa-dove"></i> 2nd October • Gandhi Jayanti 2026</div>
      <h1 class="article-title">50+ Inspiring Gandhi Jayanti Quotes &amp; Thoughts</h1>
      <p class="article-sub">Celebrate the birth anniversary of Mahatma Gandhi with enduring wisdom on peace, non-violence, truth, simplicity, and nation-building. Copy quotes in one click or design custom posters.</p>
    </div>

    <!-- Quick Jump TOC -->
    <div class="quick-toc">
      <div class="toc-title"><i class="fa-solid fa-compass" style="color:var(--accent-primary);"></i> Quick Section Index</div>
      <div class="toc-grid">
{toc_pills}
      </div>
    </div>

    <!-- Quote Sections -->
{sections_rendered}

    <!-- Author Spotlight -->
    <div class="author-spotlight">
      <div class="spotlight-avatar">MG</div>
      <div class="spotlight-info">
        <h2 class="spotlight-title">Mahatma Gandhi Author Archive</h2>
        <p class="spotlight-text">Looking for more wisdom from Bapu? Explore our dedicated Mahatma Gandhi archive featuring 112+ curated quotes with historical tags and reading options.</p>
        <a href="../authors/mahatma-gandhi.html" class="spotlight-link">
          <span>Explore All Gandhi Quotes</span>
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </div>

    <!-- FAQ Section -->
    <section class="faq-section">
      <h2 class="faq-title">Frequently Asked Questions</h2>
      <div class="faq-item">
        <h3 class="faq-question">What is Gandhi Jayanti and why is it celebrated?</h3>
        <p class="faq-answer">Gandhi Jayanti is observed across India on 2nd October each year to honor the birth of Mohandas Karamchand Gandhi (1869–1948). Renowned worldwide as the pioneer of Satyagraha (resistance through mass non-violent civil disobedience), his philosophy led India to freedom and inspired civil rights movements across the globe. Internationally, the UN marks this day as the International Day of Non-Violence.</p>
      </div>
      <div class="faq-item">
        <h3 class="faq-question">What are the three main pillars of Gandhi's philosophy?</h3>
        <p class="faq-answer">The three core pillars of Gandhi's teachings are <strong>Satya</strong> (uncompromising commitment to Truth), <strong>Ahimsa</strong> (active non-violence and love toward all living beings), and <strong>Sarvodaya</strong> (progress and upliftment of everyone, especially the most vulnerable).</p>
      </div>
      <div class="faq-item">
        <h3 class="faq-question">How can I make a quote poster for Gandhi Jayanti?</h3>
        <p class="faq-answer">Simply click the 'Poster' button next to any quote on this page. It will take you to Quotebook's free Poster Studio, where you can pair the quote with high-resolution photography, customize typography, and download a square (1080×1080) PNG image instantly with no login or watermark.</p>
      </div>
    </section>

  </main>

  <!-- Global Footer -->
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">
          <div class="logo-icon"><img src="../data/img/logo.svg" alt="Quotebook Logo" class="brand-logo-img"></div>
          <span class="logo-title">Quotebook</span>
        </div>
        <p>A modern editorial web application for discovering quotes, listening aloud, and generating canvas posters with Pixabay photography.</p>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4>Navigation</h4>
          <a href="/">Home</a>
          <a href="/quotes.html">Quotes Library</a>
          <a href="/poster.html">Poster Studio</a>
          <a href="/quotes/">Browse Categories</a>
          <a href="/authors/">Browse Authors</a>
          <a href="/about.html">About Us</a>
          <a href="/contact.html">Contact Us</a>
        </div>

        <div class="footer-col">
          <h4>Related Topics</h4>
          <a href="/authors/mahatma-gandhi.html">Mahatma Gandhi Quotes</a>
          <a href="/quotes/popular-quotes.html">100 Most Popular Quotes</a>
          <a href="/quotes/stoic-philosophy/stoic-philosophy-wisdom.html">Wisdom Quotes</a>
          <a href="/quotes/motivation-hustle/motivation-hustle-success-mindset.html">Motivation Quotes</a>
          <a href="/terms.html">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2026 Quotebook. Powered by Pixabay API &amp; Open Quote Datasets.</p>
    </div>
  </footer>

  <!-- Toast Notification -->
  <div class="toast" id="copyToast">
    <i class="fa-solid fa-circle-check" style="color:#22c55e;"></i>
    <span>Quote copied to clipboard!</span>
  </div>

  <script>
    function copyQuote(btn, text) {{
      navigator.clipboard.writeText(text).then(() => {{
        const toast = document.getElementById('copyToast');
        toast.classList.add('show');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
        setTimeout(() => {{
          toast.classList.remove('show');
          btn.innerHTML = originalHTML;
        }}, 2000);
      }});
    }}
  </script>
</body>
</html>
'''

with open('quotes/gandhi-jayanti-quotes.html', 'w', encoding='utf-8') as f:
    f.write(html_page)

print("quotes/gandhi-jayanti-quotes.html generated successfully!")
