export const STRIPE_TEST_CARD = "4242424242424242";

export const demo = {
  enabled: true,
  badge: "Sample site",
  launcherLabel: "Sample notes",
  welcome: {
    title: "You’re looking at a sample booking site",
    intro:
      "This is a working demo for trainers to click through as a client would. A few things are placeholders until the site is set up for a real business.",
    bullets: [
      "Brand name, phone, email, and social links are sample data - not a live trainer’s details.",
      "Photos are stock images. Swap them for your own dogs and ground.",
      "Heath and Field are two looks for the public site. Switch them in these sample notes.",
      "Live card payments need a Stripe account linked to a bank. On this sample you can still try checkout with Stripe’s test card (details on the pay step).",
      "Emails are not reaching clients yet. Resend is connected, but the test sender only delivers to the Resend account inbox. Confirmations, reminders, enquiries, and waitlist mail will not reach anyone else until a domain is verified. They do not appear in the admin dashboard.",
      "Films on the Videos page are Crufts gundog videos until a YouTube channel id is set.",
    ],
    continueLabel: "Continue to the sample site",
  },
  payment: {
    title: "Payments are not live yet",
    body: "Real charges cannot be taken until Stripe is connected to a bank account. This sample can still open the Stripe checkout screen in test mode.",
    testCardLabel: "Stripe test card",
    testCardHint:
      "Use any future expiry date, any 3-digit CVC, and any postcode. No real money is taken in test mode.",
    afterPay:
      "A paid booking is meant to email the client a confirmation with a cancel/reschedule link. That email is not sending yet. The test sender only delivers to the Resend account inbox, and it does not show in admin.",
  },
  contact: {
    title: "What the customer receives",
    body: "A message on this form is saved under Admin → Enquiries. The customer sees a thank-you on the page. They do not get an email for a contact message. You are meant to receive the enquiry by email, but that is not sending yet: the test sender only delivers to the Resend account inbox. A paid booking is separate. The customer should get a confirmation with a link to cancel or reschedule, you should be emailed too, and a reminder should go out the day before. Those emails are not reaching clients at the moment, and they never appear in the admin dashboard.",
  },
  diary: {
    title: "Diary and booking",
    body: "When the diary database is not connected, clients see the session prices and are told times are not open. Connect the database and they can choose a time and pay.",
  },
  videos: {
    title: "Placeholder films",
    body: "The films on this page are Crufts gundog videos. Set YOUTUBE_CHANNEL_ID and the page shows that channel’s latest uploads. Clients only see the films and a link to YouTube.",
    fallback: "The channel feed did not load, so the Crufts films are showing.",
  },
  cookies: {
    title: "Why this cookies page is here",
    body: "A live trainer site needs a clear list of what is stored, so this sample includes the same cookies page a client would see. The Heath/Field look cookie, admin sign-in cookies, and anonymous page/booking events are real behaviour of this demo - not advertising tracking.",
    untilLive:
      "On a live site you would still see this kind of page: the same strictly necessary cookies, named for the real business, with a short notice on the first visit. You would not normally see extra marketing cookies unless the trainer added them. Until the site is live, treat this as the pattern - the wording and domain will match the real practice once it is launched.",
  },
  admin: {
    title: "Admin dashboard",
    body: "The Admin dashboard is the trainer’s private area (sign in from /admin). Bookings, intakes, waitlist, and enquiries here are real records for this demo database. Confirmation emails, day-before reminders, and waitlist “a time has opened” messages are not listed in admin. They are not reaching clients yet, because the test sender only delivers to the Resend account inbox. Prices, hours, and public copy are still sample data until you change them.",
  },
  login: {
    title: "Admin dashboard sign in",
    body: "This sign-in is for the trainer, not the public booking form. Use the demo admin account you were given. After launch, only the trainer’s own login will work here.",
  },
  adminTabs: {
    overview: {
      title: "Admin dashboard - Overview",
      body: "This tab is a snapshot of the practice: today’s sessions, upcoming confirmed bookings, intakes waiting to be read, and recent contact messages. Counts come from this demo database, so you can click through as the trainer would.",
      untilLive:
        "You will not see client confirmation emails or day-before reminders here. They are not sending to clients yet: the test sender only delivers to the Resend account inbox. You also cannot take real card payments from this overview - that needs a Stripe account linked to a bank.",
    },
    bookings: {
      title: "Admin dashboard - Bookings",
      body: "Filter and open sessions, see who booked, which dog, payment status, and session time. From a booking you can follow the same cancel or reschedule path a client uses. Sample bookings in this database are real rows you can inspect.",
      untilLive:
        "A paid booking on this sample uses Stripe test mode, so no real money is taken. The confirmation email with a manage link is not reaching the client yet: the test sender only delivers to the Resend account inbox. Refunds and bank payouts will not appear until the trainer’s Stripe account is connected.",
    },
    clients: {
      title: "Admin dashboard - Clients",
      body: "Owners appear here after they submit an intake or complete a booking. Open a client to see their dogs, session history, and private files. You can delete a demo client record; that removes the rows and stored files this site holds.",
      untilLive:
        "Until the site is live these are sample (or demo-created) people, not a real client list. Stripe may still keep payment records under its own rules even if you delete a row here. Exporting a full client list for another system is not included until you ask for it.",
    },
    availability: {
      title: "Admin dashboard - Availability",
      body: "Set weekly opening hours, lunch breaks, and blocked dates (holidays or days off). The public booking calendar only offers times that match these rules. Changes here update the book page for this demo immediately.",
      untilLive:
        "Hours and blocked dates on this sample are placeholders. Before taking real bookings you would set your actual week and block real holidays. Clients are not emailed when you change hours - they only see the calendar the next time they book.",
    },
    intakes: {
      title: "Admin dashboard - Intakes",
      body: "Dog intake forms submitted from the public site land here, with a link to the generated PDF. Open Intakes after you sign in - the login page itself does not list them. PDF links expire after 10 minutes for privacy.",
      untilLive:
        "New intakes save in this demo database. The email ping to you is not sending yet, except to the Resend account inbox. Clients do not see this tab.",
    },
    documents: {
      title: "Admin dashboard - Documents",
      body: "Intake PDFs and extra records you upload for a client. Downloads use a private link that expires after 10 minutes. You can attach a file to an existing client on this tab.",
      untilLive:
        "Until the live storage bucket is connected, files live in this demo’s private storage. Clients cannot browse documents from the public site. Signed downloads and extra record types are ready; they just need your live bucket and real client files.",
    },
    enquiries: {
      title: "Admin dashboard - Enquiries",
      body: "Messages from the public contact form. Name, email, phone, and the message are stored even if notification email is off, so you can still reply from here.",
      untilLive:
        "Enquiry emails are not sending yet. The test sender only delivers to the Resend account inbox, so check this tab for new messages. The sample contact details on the public site are placeholders.",
    },
    analytics: {
      title: "Admin dashboard - Analytics",
      body: "Last 30 days of anonymous page views and booking steps (for example someone opened /book and left before paying). No names, emails, or IP addresses. Use it to see where people drop off.",
      untilLive:
        "Until the site is public you will mostly see demo traffic from people clicking through the sample. After launch this tab shows real visitor patterns. It is not Google Analytics and it does not build advertising profiles.",
    },
    waitlist: {
      title: "Admin dashboard - Waitlist",
      body: "People who asked to be emailed if a full day opens. They are stored here with the date they wanted. When a session on that date is cancelled, the live site emails them a link to book.",
      untilLive:
        "Joining the waitlist still saves a row you can see here, but the “a time has opened” email is not sending yet. The test sender only delivers to the Resend account inbox. Waitlist is not offered for days or remaining times that have already passed.",
    },
    support: {
      title: "Admin dashboard - Support",
      body: "Raise a bug, a wording change, or something you would like added. Status updates stay on this tab so you can see what was sent and whether it is in progress.",
      untilLive:
        "This works on the sample site - you can send a request now. It is not a public contact form. After launch this remains the trainer’s channel for site changes; clients still use Contact or the booking flow.",
    },
  },
} as const;
