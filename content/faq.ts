export const sessionExpectContent = {
  id: "sessions",
  heading: "What to expect in a session",
  intro:
    "Sessions are one-to-one and built around the dog in front of us — not a generic syllabus. You leave with homework you can actually do in a spare twenty minutes.",
  blocks: [
    {
      title: "How a session typically runs",
      body: "We start with what you want and what the dog is already offering. Then we work in short, clear pictures: sit, stop, hunt, retrieve, or heel, depending on the job. Virtual sessions are coached over video so you handle your own dog. In person, I work beside you on your ground or a suitable local space.",
    },
    {
      title: "What you should bring",
      body: "A slip lead is the most useful bit of kit — a flat collar and ordinary lead is fine if that is what you have. Bring water for the dog, weather-proof clothing for you, and any food or toy you already use as payment. If the dog wears a GPS or training collar, bring that too so we can see the real picture.",
    },
    {
      title: "What I can provide",
      body: "Dummies, a whistle to try, a place board or box, and a long line if we need a safety net. I can lend kit for the hour so you do not have to buy everything before we know what suits the dog. You keep your own lead and the relationship — the extras are there to teach the picture, not to replace your handling.",
    },
    {
      title: "More than one dog",
      body: "The recommendation is separate sessions. Each dog needs your full attention, and two aroused gundogs in one hour usually means neither gets a clean picture. Once the basics are there we can book a household session for heel, settle, and manners around each other — say so on the intake. Puppies from the same home can sometimes share an assessment; working adults almost always do better one at a time.",
    },
  ],
} as const;

export const faqContent = {
  heading: "FAQs",
  items: [
    {
      question: "How do I book?",
      answer:
        "Choose virtual or in person, pick a date and time, complete the dog intake, and pay by card. You will get a confirmation email with a link to cancel or reschedule.",
    },
    {
      question: "What should I bring to an in-person session?",
      answer:
        "A slip lead (or your usual lead), water for the dog, and weather-appropriate clothing. Treats or a toy if you use them. I bring dummies, a whistle to try, and other training kit we might need.",
    },
    {
      question: "Can two dogs share a session?",
      answer:
        "Usually not for the first sessions. The honest recommendation is one dog per hour so we can train, not just manage. A later household session for manners around each other is possible — tell me on the intake and we will plan it.",
    },
    {
      question: "Where do in-person sessions happen?",
      answer:
        "At your home, a local patch of ground you already use, or another suitable outdoor space we agree in advance. I travel to you rather than running a kennels yard.",
    },
    {
      question: "How do virtual sessions work?",
      answer:
        "We meet on a video call. You handle your dog; I coach. A reminder with the join link is sent the day before. You do not need a special app.",
    },
    {
      question: "What if I need to cancel or change the time?",
      answer:
        "Use the link in your confirmation email. Please give at least 24 hours’ notice where you can. Shorter notice still frees the diary, but refunds are at my discretion because that hour is hard to refill.",
    },
    {
      question: "The day I wanted is full. Can I join a waitlist?",
      answer:
        "Yes. On the booking calendar, full days are marked and you can leave your name. If a space opens we email you so you can book it.",
    },
    {
      question: "Do you work with puppies, older dogs, or reactive dogs?",
      answer:
        "Yes, within gundog work and everyday manners. Tell me honestly about fear, aggression, or previous incidents on the intake so we can plan a safe session. I will say if a case needs a different specialist.",
    },
  ],
} as const;
