/* ------------------------------------------------------------------
   EVERYTHING YOU'LL WANT TO CHANGE LIVES HERE.
   Lines marked PLACEHOLDER still need the real information.
------------------------------------------------------------------- */
window.INVITE = {
  couple: { first: "Sarim", second: "Tala" },
  monogramFont: "Great Vibes",          // script font for the S & T monogram (see monograms.html for the choices)

  nikkah: {
    title: "Nikkah",
    date: "2027-05-30T17:00:00",          // May 30, 2027. The 17:00 hour is a PLACEHOLDER (used only by the countdown and calendar)
    timeLabel: "Time to follow",           // delete this line once the hour above is real
    venue: "Venue to be announced",        // PLACEHOLDER
    address: "Address to follow",          // PLACEHOLDER
    mapUrl: "",                            // paste a Google Maps link to show a "Get directions" button
    schedule: [                            // add a time in the first quotes once known, e.g. "5:00 pm"
      ["", "Guests arrive"],
      ["", "Nikkah ceremony"],
      ["", "Dua & congratulations"],
      ["", "Dinner"]
    ]
  },

  wedding: {
    title: "Wedding",
    date: "2027-08-06T19:00:00",          // August 6, 2027, 7 pm
    timeLabel: "7 – 11 pm",
    venue: "Versailles Convention Centre",
    address: "6721 Edwards Blvd, Mississauga, ON L5T 2V9",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Versailles+Convention+Centre%2C+6721+Edwards+Blvd%2C+Mississauga%2C+ON+L5T+2V9",
    schedule: [                            // PLACEHOLDER times in between (7 pm start and 11 pm end are real)
      ["7:00 pm", "Doors open"],
      ["7:45 pm", "Grand entrance"],
      ["8:30 pm", "Dinner is served"],
      ["11:00 pm", "Farewell"]
    ]
  },

  rsvp: {
    // Paste a form endpoint (e.g. a Formspree URL) and replies will be sent there.
    // While this is empty, replies are only saved in the guest's own browser.
    endpoint: ""
  }
};
