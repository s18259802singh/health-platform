// Sample health articles so the blog is full on a fresh demo (16 articles).
// Cover images are custom SVG illustrations (stored as data URLs), each one
// designed to match its article's topic and the site's Pulse theme. The admin
// can still publish articles with uploaded photo images from the Blog page.

module.exports = [
  {
    title: 'Why Donating Blood Is One of the Easiest Ways to Save a Life',
    excerpt: 'One donation can save up to three lives. Here is what actually happens when you donate, and why your body barely notices.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cpath%20d%3D%27M0%2C-95%20C42%2C-38%2072%2C-2%2072%2C38%20A72%2C72%200%201%201%20-72%2C38%20C-72%2C-2%20-42%2C-38%200%2C-95%20Z%27%20fill%3D%27%23ff3b4e%27%2F%3E%3Cpath%20d%3D%27M-26%2C28%20L26%2C28%20M0%2C2%20L0%2C54%27%20stroke%3D%27%23fff%27%20stroke-width%3D%2713%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EGIVE%20BLOOD%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Every two seconds, someone somewhere needs blood - accident victims, surgery patients, mothers in childbirth, people fighting cancer. Yet less than a tenth of the eligible population ever donates. The gap between need and supply is filled by ordinary people who give up half an hour of their day.

> Blood cannot be made in a factory. Every unit in every hospital fridge came out of somebody's arm.

## What your body actually gives up

A single donation is about 350 to 450 ml of blood, which your body replaces remarkably quickly.

- **The fluid** is restored within 24 to 48 hours - which is why you are asked to drink before and after.
- **Red cells** are fully replenished in four to six weeks.
- **One unit** is separated into red cells, plasma and platelets, so your one donation can help up to three different patients.

[photo: donating]

## Half an hour, start to finish

The process itself is simple, and most of it is paperwork and resting.

1. A short health check - blood pressure, haemoglobin from a finger prick, a few questions.
2. The donation itself, which takes **8 to 10 minutes**.
3. A few minutes lying down, a snack, and you carry on with your day.

Most healthy adults aged 18 to 65, weighing at least 50 kg, can donate every three months.

!> That is four donations a year, and up to twelve patients helped, for two hours of your time.

## The first time is the only hard one

If you have never donated, the hardest part is walking in the first time. Find a blood bank near you on the Hospitals page, or check the Blood Requests board to see who needs your blood group right now.`,
  },
  {
    title: 'Know Your Blood Group: Who Can You Give To, and Who Can Give to You?',
    excerpt: 'O-negative is the universal donor, AB-positive the universal receiver - but the full compatibility chart is worth knowing by heart.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cg%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27bold%27%20fill%3D%27%23ff3b4e%27%3E%3Ctext%20x%3D%27-178%27%20y%3D%27-25%27%20font-size%3D%2784%27%20text-anchor%3D%27middle%27%3EA%3C%2Ftext%3E%3Ctext%20x%3D%27-62%27%20y%3D%27-25%27%20font-size%3D%2784%27%20text-anchor%3D%27middle%27%3EB%3C%2Ftext%3E%3Ctext%20x%3D%2772%27%20y%3D%27-25%27%20font-size%3D%2784%27%20text-anchor%3D%27middle%27%3EAB%3C%2Ftext%3E%3Ctext%20x%3D%27192%27%20y%3D%27-25%27%20font-size%3D%2784%27%20text-anchor%3D%27middle%27%3EO%3C%2Ftext%3E%3Ctext%20x%3D%27-178%27%20y%3D%2775%27%20font-size%3D%2758%27%20text-anchor%3D%27middle%27%20fill%3D%27%23ffb0b8%27%3E%2B%3C%2Ftext%3E%3Ctext%20x%3D%27-62%27%20y%3D%2775%27%20font-size%3D%2758%27%20text-anchor%3D%27middle%27%20fill%3D%27%23ffb0b8%27%3E-%3C%2Ftext%3E%3Ctext%20x%3D%2772%27%20y%3D%2775%27%20font-size%3D%2758%27%20text-anchor%3D%27middle%27%20fill%3D%27%23ffb0b8%27%3E%2B%3C%2Ftext%3E%3Ctext%20x%3D%27192%27%20y%3D%2775%27%20font-size%3D%2758%27%20text-anchor%3D%27middle%27%20fill%3D%27%23ffb0b8%27%3E-%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EKNOW%20YOUR%20TYPE%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Blood groups are decided by two systems: ABO (A, B, AB or O) and the Rh factor (positive or negative). Together they give the eight familiar groups - A+, A-, B+, B-, AB+, AB- O+ and O-.

## The pattern behind the chart

The rules of compatibility are simple once you see the pattern.

- **O-negative** can be given to anyone. That is why it is called the universal donor, and why blood banks are permanently short of it.
- **AB-positive** people can receive from anyone, but can only donate to other AB-positives.
- **Negative groups** can give to their positive counterparts, but not the other way round.
- **Plasma runs backwards:** AB is the universal plasma donor, O the universal plasma recipient.

[photo: lab]

> O-negative is roughly seven per cent of donors and the first bag reached for in every unidentified emergency. The arithmetic is why it runs out.

## Why it matters at 3am

In an emergency, doctors will not have time to look up your group - which is exactly why this platform gives every member an Emergency QR code. Anyone who scans it sees your blood group, allergies and emergency contact instantly, with no login.

!> The compatibility checker on the Find Donors page will filter the live register to everyone able to give to a particular patient.

## Two minutes, today

Confirm your own blood group is correct on your Profile page, and tick the "willing to donate" box if you are. When someone in your city posts a request for your group, you could be the person who answers it.`,
  },
  {
    title: 'First Aid Basics: What to Do in the First Five Minutes of an Emergency',
    excerpt: 'Before the ambulance arrives, the actions of whoever is nearby often decide the outcome. These are the basics everyone should know.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Crect%20x%3D%27-95%27%20y%3D%27-70%27%20width%3D%27190%27%20height%3D%27140%27%20rx%3D%2722%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%279%27%2F%3E%3Cpath%20d%3D%27M-38%2C0%20L38%2C0%20M0%2C-38%20L0%2C38%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%2724%27%20stroke-linecap%3D%27round%27%2F%3E%3Ccircle%20cx%3D%2772%27%20cy%3D%27-52%27%20r%3D%279%27%20fill%3D%27%23ffb0b8%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EFIRST%20AID%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `In most emergencies, professional help is minutes away - but the first few minutes belong to whoever happens to be standing there. Knowing a handful of basics can make you genuinely useful instead of helpless.

## First: make the call

Keep yourself safe, then call for help immediately. In India, dial **112** for any emergency or **108** for an ambulance. Speak clearly:

- where you are, as precisely as you can
- what happened
- how many people are hurt
- whether anyone is unconscious or bleeding heavily

## Heavy bleeding

Press firmly on the wound with a clean cloth and do not let go, even when the cloth soaks through - add more cloth on top. Raise the injured limb if you can.

!> Lifting the cloth to check whether the bleeding has stopped undoes the clot you have just spent five minutes forming. Leave it.

For a suspected fracture, do not try to straighten anything; keep the person still.

[photo: armCuff]

## Unconscious but breathing

Roll them gently onto their side - the recovery position - so their airway stays clear, and stay with them.

> If they are carrying an Emergency QR code, scan it. Blood group, allergies and next of kin, on your screen in seconds, ready to hand to the paramedics.

## Worth two hours of your life

A short first aid course - the Red Cross and St John Ambulance both run them - turns all of the above from something you have read into something your hands remember.`,
  },
  {
    title: 'Seven Myths About Blood Donation That Stop People From Giving',
    excerpt: 'It does not make you weak, it does not hurt much, and no, you cannot catch anything. Time to retire the excuses.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cpath%20d%3D%27M0%2C-95%20C42%2C-38%2072%2C-2%2072%2C38%20A72%2C72%200%201%201%20-72%2C38%20C-72%2C-2%20-42%2C-38%200%2C-95%20Z%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%278%27%20stroke-dasharray%3D%2716%2012%27%2F%3E%3Ctext%20x%3D%270%27%20y%3D%2742%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%27105%27%20font-weight%3D%27bold%27%20fill%3D%27%23ff3b4e%27%3E%3F%3C%2Ftext%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EMYTH%20VS%20FACT%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Ask people why they have never donated blood and you hear the same handful of reasons. Almost all of them are myths.

## "It will make me weak"

Your body replaces the fluid within a day or two, and most donors go back to work the same day. You are asked to avoid heavy lifting and the gym for a few hours, and that is the extent of it.

## "It is painful"

There is a single needle prick, comparable to any blood test, and the donation itself is painless.

## "I might catch an infection"

Every needle and bag is sterile, sealed and used exactly once. There is no route for infection to reach you.

[photo: testing]

## The ones about who is allowed

- **"Vegetarians cannot donate"** - completely false. What matters is your haemoglobin level, which is checked before every donation.
- **"I take medicines, so I cannot donate"** - many common medicines are perfectly fine; the staff will tell you at the screening.
- **"I am too old or too young"** - the actual window is wide: **18 to 65** for most donors.

!> Every one of these is settled in two minutes at the screening desk, free, with no obligation to donate afterwards.

## The last myth, and the real one

> "Someone else will do it."

Blood cannot be manufactured. Every unit in every hospital fridge came from a person who decided not to leave it to someone else.`,
  },
  {
    title: 'Are You Eligible to Donate? A Simple Checklist',
    excerpt: 'Age, weight, haemoglobin, recent illness, tattoos - run through this two-minute checklist before you head to the blood bank.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cg%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%2710%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20fill%3D%27none%27%3E%3Cpath%20d%3D%27M-135%2C-60%20L-108%2C-33%20L-62%2C-82%27%2F%3E%3Cpath%20d%3D%27M-135%2C15%20L-108%2C42%20L-62%2C-7%27%2F%3E%3Cpath%20d%3D%27M-135%2C90%20L-108%2C117%20L-62%2C68%27%2F%3E%3C%2Fg%3E%3Cg%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%279%27%20stroke-linecap%3D%27round%27%20opacity%3D%270.8%27%3E%3Cpath%20d%3D%27M-15%2C-55%20L140%2C-55%27%2F%3E%3Cpath%20d%3D%27M-15%2C20%20L140%2C20%27%2F%3E%3Cpath%20d%3D%27M-15%2C95%20L140%2C95%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EAM%20I%20ELIGIBLE%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `The basic requirements are straightforward, and you can check all of them yourself before you go.

## The four that are checked every time

- Age between **18 and 65**
- Weight at least **50 kg**
- Haemoglobin of at least **12.5 g/dl**, tested on the spot with a finger prick
- Feeling generally well on the day

## Things that mean waiting, not never

This is where most people rule themselves out unnecessarily. A deferral is a date, not a verdict.

- Fever, cold or antibiotics recently - wait until **two weeks** after full recovery.
- A new tattoo or piercing - usually **six to twelve months**.
- Malaria, dengue or typhoid - specific periods the blood bank staff will explain.
- Pregnancy, and a period after childbirth.

[photo: lab]

!> If you are unsure, go and ask. The pre-donation screening exists for exactly this, and staff would far rather answer questions than turn people away.

## The few that are permanent

Certain heart conditions, epilepsy, and some infections do rule out donation for good. The screening will tell you plainly.

## Preparing, in one line

> Eat a proper meal, drink plenty of water, skip the alcohol the night before, and carry photo ID. That is the whole preparation.`,
  },
  {
    title: 'Whole Blood, Plasma, Platelets: What Actually Happens to Your Donation',
    excerpt: 'Your one bag of blood is split into components that go to three very different patients. Here is the journey it takes.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Ccircle%20cx%3D%27-120%27%20cy%3D%2710%27%20r%3D%2758%27%20fill%3D%27%23ff3b4e%27%2F%3E%3Ccircle%20cx%3D%270%27%20cy%3D%27-45%27%20r%3D%2758%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%278%27%2F%3E%3Ccircle%20cx%3D%27120%27%20cy%3D%2710%27%20r%3D%2758%27%20fill%3D%27none%27%20stroke%3D%27%23a3172b%27%20stroke-width%3D%2714%27%2F%3E%3Cpath%20d%3D%27M-62%2C-16%20L-30%2C-36%20M62%2C-16%20L30%2C-36%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%275%27%20opacity%3D%270.7%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EONE%20BAG%2C%20THREE%20LIVES%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Most donations are "whole blood" - but almost no patient receives whole blood any more. Within hours of your donation, the bag is spun in a centrifuge and separated into three components, because different patients need different parts.

[photo: bloodBag]

## Red cells

They carry oxygen, and they go to accident victims, surgical patients and people with severe anaemia. Stored at 4 degrees, they keep for about **35 to 42 days**.

## Plasma

The straw-coloured liquid that carries clotting factors and proteins. It is used for burns patients, liver patients and people with clotting disorders. Frozen, it keeps for up to **a year**.

## Platelets

The fragments that stop bleeding. Cancer patients on chemotherapy often cannot make their own, so they depend entirely on donors.

!> Platelets survive only about five days. That single fact is why blood banks need a steady stream of donors rather than one big drive a year.

## Why "three lives" is not a slogan

> Your red cells may reach a road accident victim, your plasma a burns ward, and your platelets a child on chemotherapy - all in the same week, from one bag.

It is not a figure of speech. It is literally how the bag is processed.`,
  },
  {
    title: 'Thalassemia: Why Some Children Need Blood Every Three Weeks',
    excerpt: 'For thousands of families, blood transfusion is not an emergency - it is a monthly routine. Regular donors are their lifeline.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Crect%20x%3D%27-100%27%20y%3D%27-75%27%20width%3D%27200%27%20height%3D%27170%27%20rx%3D%2716%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%278%27%2F%3E%3Cpath%20d%3D%27M-100%2C-30%20L100%2C-30%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%278%27%2F%3E%3Cpath%20d%3D%27M-55%2C-95%20L-55%2C-60%20M55%2C-95%20L55%2C-60%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%2710%27%20stroke-linecap%3D%27round%27%2F%3E%3Cpath%20d%3D%27M0%2C-8%20C18%2C16%2030%2C30%2030%2C46%20A30%2C30%200%201%201%20-30%2C46%20C-30%2C30%20-18%2C16%200%2C-8%20Z%27%20fill%3D%27%23ff3b4e%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3ETHALASSEMIA%20CARE%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Thalassemia major is an inherited condition in which the body cannot make enough healthy haemoglobin. Children born with it typically need a blood transfusion **every two to four weeks** - for life.

India has one of the largest thalassemia populations in the world, and Gujarat is among the states with a higher carrier rate.

## What that means for a family

For these families, the blood bank is not a place they visit after an accident; it is part of the monthly calendar.

> A single child may need well over 300 units of blood by adulthood.

That demand can only be met by repeat donors who give regularly - not by emergency appeals and not by one drive a year.

[photo: community]

## The prevention side, which gets far less attention

A simple blood test can tell whether you are a thalassemia carrier. Carriers are healthy and usually have no idea.

!> When two carriers marry, each child has a one-in-four chance of being born with thalassemia major. Carrier screening before marriage, or early in pregnancy, is the single most effective thing anyone can do about this condition.

## If you want your donations to count twice

Ask your local blood bank about becoming a regular donor for thalassemia patients. Many pair donors with specific children.

- You give on a schedule, not on an appeal.
- The centre can plan around you.
- Few things you do this year will matter more to one family.`,
  },
  {
    title: 'Iron and Haemoglobin: Eating Your Way to Being a Better Donor',
    excerpt: 'Low haemoglobin is the number one reason donors get turned away. The fix is usually on your plate.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cpath%20d%3D%27M0%2C95%20C-95%2C60%20-80%2C-45%200%2C-88%20C14%2C-30%2090%2C-10%2062%2C52%20C44%2C88%2020%2C98%200%2C95%20Z%27%20fill%3D%27none%27%20stroke%3D%27%235fdfae%27%20stroke-width%3D%279%27%2F%3E%3Cpath%20d%3D%27M0%2C-88%20C-8%2C-20%20-6%2C40%200%2C95%27%20stroke%3D%27%235fdfae%27%20stroke-width%3D%276%27%20fill%3D%27none%27%2F%3E%3Ctext%20x%3D%2795%27%20y%3D%2730%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2788%27%20font-weight%3D%27bold%27%20fill%3D%27%23ff3b4e%27%3EFe%3C%2Ftext%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EIRON%20%26amp%3B%20HAEMOGLOBIN%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Every donor is tested for haemoglobin before donating, and low haemoglobin is the most common reason people are turned away. The good news: for most people it is a diet issue, and it responds well to simple changes.

## Where the iron comes from

Vegetarian sources are plentiful, despite the myth:

- Spinach and other leafy greens
- Beetroot, dates and jaggery
- Ragi and whole pulses
- Sesame and pumpkin seeds

Non-vegetarians can add eggs and lean meat. Cooking in an iron kadhai genuinely adds a small amount of iron to the food too.

[photo: lab]

## Absorption matters as much as intake

This is the part most people miss.

!> Vitamin C dramatically improves iron absorption. A squeeze of lemon over your dal, or a glass of orange juice with a meal, does more than another helping of spinach.

> Tea and coffee taken with meals block iron absorption. Keep them an hour away from food, and nothing else about your diet needs to change.

## When diet is not the answer

If your haemoglobin stays low despite eating well, see a doctor rather than pushing harder with diet - persistent anaemia can have causes that need proper checking.

And once your levels are healthy, come back. Blood banks are always glad to see a deferred donor return.`,
  },
  {
    title: 'The Rare Ones: Bombay Blood Group and Other Types You Have Never Heard Of',
    excerpt: 'Beyond the familiar eight groups lies a world of rare blood types - and for those patients, finding a donor is a race.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cg%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%275%27%20opacity%3D%270.45%27%3E%3Cpath%20d%3D%27M-150%2C-40%20C-134%2C-18%20-122%2C-4%20-122%2C12%20A28%2C28%200%201%201%20-178%2C12%20C-178%2C-4%20-166%2C-18%20-150%2C-40%20Z%27%2F%3E%3Cpath%20d%3D%27M150%2C-40%20C166%2C-18%20178%2C-4%20178%2C12%20A28%2C28%200%201%201%20122%2C12%20C122%2C-4%20134%2C-18%20150%2C-40%20Z%27%2F%3E%3Cpath%20d%3D%27M-75%2C55%20C-59%2C77%20-47%2C91%20-47%2C107%20A28%2C28%200%201%201%20-103%2C107%20C-103%2C91%20-91%2C77%20-75%2C55%20Z%27%2F%3E%3Cpath%20d%3D%27M75%2C55%20C91%2C77%20103%2C91%20103%2C107%20A28%2C28%200%201%201%2047%2C107%20C47%2C91%2059%2C77%2075%2C55%20Z%27%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%27M0%2C-75%20C30%2C-32%2052%2C-6%2052%2C24%20A52%2C52%200%201%201%20-52%2C24%20C-52%2C-6%20-30%2C-32%200%2C-75%20Z%27%20fill%3D%27%23ff3b4e%27%2F%3E%3Ctext%20x%3D%270%27%20y%3D%2736%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2742%27%20font-weight%3D%27bold%27%20fill%3D%27%23fff%27%3Ehh%3C%2Ftext%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3ERARE%20BLOOD%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Most people know the eight standard groups. Far fewer know about the Bombay blood group (hh), first discovered in Mumbai in 1952.

## Mistyped as O, compatible with almost nobody

People with the Bombay group are routinely recorded as O - but they can receive blood only from another Bombay group donor.

> Fewer than one in ten thousand Indians has it. When a Bombay group patient needs surgery, the search for a donor can span states.

Registries of rare donors exist precisely for this. If you have ever been told your blood group is unusual, get it confirmed and register.

[photo: testing]

## Other patterns that matter

- **Rh-null**, sometimes called golden blood, found in fewer than fifty known people worldwide.
- **Minor antigen combinations**, which matter enormously for patients who receive many transfusions over years - thalassemia patients above all.

!> A patient who has had hundreds of transfusions can develop antibodies that make ordinary matching insufficient. For them, a broad donor database is not a convenience; it is the whole search.

## What everyone else can do about it

Rare-group patients depend on wide, searchable donor databases.

1. Keep your blood group on your profile correct.
2. Keep your city current.
3. Leave the donor flag ticked.

Three small fields, and the search that finds them runs in seconds instead of weeks.`,
  },
  {
    title: 'CPR: The Skill That Doubles Survival, Explained Simply',
    excerpt: 'When the heart stops, brain damage begins in minutes. Hands-only CPR is simple enough for anyone to learn today.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cpath%20d%3D%27M0%2C78%20C-88%2C22%20-105%2C-40%20-62%2C-68%20C-30%2C-88%20-6%2C-64%200%2C-46%20C6%2C-64%2030%2C-88%2062%2C-68%20C105%2C-40%2088%2C22%200%2C78%20Z%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%2710%27%2F%3E%3Cpath%20d%3D%27M-95%2C0%20L-38%2C0%20L-24%2C-24%20L-8%2C26%20L6%2C-34%20L20%2C22%20L32%2C0%20L95%2C0%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%277%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EHANDS-ONLY%20CPR%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `When someone collapses and stops breathing normally, their survival is decided in the next few minutes - long before an ambulance can arrive.

> Bystander CPR can double or triple the chance of survival. Most people have never been shown how.

## Hands-only CPR, in four steps

Hands-only CPR removes the intimidating parts - no rescue breaths, no counting ratios.

1. Check: adult collapsed, **unresponsive**, not breathing normally.
2. Call **108**, and put the phone on speaker.
3. Heel of one hand on the centre of the chest, other hand on top, elbows locked.
4. Push **hard and fast** - about twice a second, roughly five centimetres deep - and do not stop until help arrives or the person responds.

[photo: armCuff]

## The fear that stops people

!> You cannot really make things worse. A cracked rib heals; a brain starved of oxygen does not. Hesitation, not imperfect technique, is what costs lives.

## Turn reading into muscle memory

A two-hour CPR workshop - offered by many hospitals, the Red Cross and St John Ambulance - is the difference between having read this and being able to do it.

If your college or office has never hosted one, be the person who arranges it.`,
  },
  {
    title: 'Monsoon Alert: Recognising Dengue and Malaria Before They Turn Serious',
    excerpt: 'High fever in the rainy season is never just a viral. Know the warning signs that mean hospital, now.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Crect%20x%3D%27-18%27%20y%3D%27-95%27%20width%3D%2736%27%20height%3D%27130%27%20rx%3D%2718%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%278%27%2F%3E%3Ccircle%20cx%3D%270%27%20cy%3D%2772%27%20r%3D%2738%27%20fill%3D%27%23ff3b4e%27%2F%3E%3Crect%20x%3D%27-7%27%20y%3D%27-40%27%20width%3D%2714%27%20height%3D%2790%27%20fill%3D%27%23ff3b4e%27%2F%3E%3Cg%20stroke%3D%27%237db4ff%27%20stroke-width%3D%277%27%20stroke-linecap%3D%27round%27%3E%3Cpath%20d%3D%27M-110%2C-60%20C-102%2C-45%20-118%2C-38%20-110%2C-22%27%2F%3E%3Cpath%20d%3D%27M110%2C-60%20C118%2C-45%20102%2C-38%20110%2C-22%27%2F%3E%3Cpath%20d%3D%27M-140%2C10%20C-132%2C25%20-148%2C32%20-140%2C48%27%2F%3E%3Cpath%20d%3D%27M140%2C10%20C148%2C25%20132%2C32%20140%2C48%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EMONSOON%20FEVERS%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Every monsoon, hospitals across Gujarat fill with fever cases - and every year, lives are lost to dengue and malaria that were treated as "just a viral fever" for too long at home.

## Dengue

Sudden high fever, severe headache, pain behind the eyes, and intense body ache.

!> The dangerous phase often comes when the fever drops - around day three to five - which is exactly when families relax. Platelet counts can crash in that window.

Warning signs that demand immediate hospital care:

- Bleeding gums or nose
- Black stools
- Persistent vomiting
- Severe stomach pain
- Unusual drowsiness or restlessness

Dengue patients with very low platelets often need platelet transfusions - another reason blood banks matter through the monsoon.

[photo: testing]

## Malaria

Fever that classically comes in cycles with chills and sweating. It is diagnosed with a simple blood test and treated effectively when caught early; untreated, some strains can kill.

## Prevention, unglamorous but effective

- No stagnant water in coolers, pots, trays and tyres
- Full-sleeve clothing at dawn and dusk
- Repellents, and nets where mosquitoes get indoors

> One rule for the season: any fever lasting more than 48 hours deserves a blood test, not another day of guessing.`,
  },
  {
    title: 'Silent and Common: Getting Ahead of High Blood Pressure',
    excerpt: 'Hypertension damages the heart, brain and kidneys for years before showing a single symptom. One reading can start changing that.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cpath%20d%3D%27M-105%2C45%20A105%2C105%200%201%201%20105%2C45%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%2710%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%276%27%20stroke-linecap%3D%27round%27%20opacity%3D%270.7%27%3E%3Cpath%20d%3D%27M-88%2C-38%20L-72%2C-28%27%2F%3E%3Cpath%20d%3D%27M0%2C-118%20L0%2C-99%27%2F%3E%3Cpath%20d%3D%27M88%2C-38%20L72%2C-28%27%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%27M0%2C45%20L62%2C-52%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%2711%27%20stroke-linecap%3D%27round%27%2F%3E%3Ccircle%20cx%3D%270%27%20cy%3D%2745%27%20r%3D%2716%27%20fill%3D%27%23ff3b4e%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EBLOOD%20PRESSURE%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `High blood pressure is called the silent killer for a boring, terrifying reason: it usually has no symptoms at all.

> Roughly one in four Indian adults has it, and a large share have no idea - because they feel completely fine while it quietly damages arteries, heart, brain and kidneys.

## Know your number

The only way to know is to measure.

- Around **120/80** is normal.
- Consistently above **140/90** needs a doctor's attention.
- Check at rest, a few times across a week, and write the readings down.

Machines are now in every pharmacy and many homes. There is no longer any excuse not to know.

[photo: armCuff]

## If the numbers are creeping up

The first prescriptions are lifestyle ones - and these are not vague wellness tips. Each one measurably lowers blood pressure.

1. Cut down salt, especially the hidden kind in pickles, papad and packaged snacks.
2. Walk briskly for thirty minutes most days.
3. Keep weight in check.
4. Limit alcohol.
5. Stop smoking.

## When medicines are prescribed

!> Take them **daily**, not "when you feel the pressure is high". You cannot feel it - that is the entire problem.

Well-controlled blood pressure means a dramatically lower risk of heart attack, stroke and kidney failure. It is one of the best returns on a daily habit in all of medicine.`,
  },
  {
    title: 'Diabetes Basics: The Sugar Test Everyone Over 30 Should Take',
    excerpt: 'India has more than 100 million people with diabetes - and a large share do not know it. Early detection changes everything.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cg%20transform%3D%27rotate%2812%29%27%3E%3Crect%20x%3D%27-95%27%20y%3D%27-45%27%20width%3D%2790%27%20height%3D%2790%27%20rx%3D%2712%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%278%27%2F%3E%3C%2Fg%3E%3Cg%20transform%3D%27rotate%28-8%29%27%3E%3Crect%20x%3D%2715%27%20y%3D%27-65%27%20width%3D%2790%27%20height%3D%2790%27%20rx%3D%2712%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%278%27%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%27M0%2C60%20C13%2C78%2022%2C89%2022%2C101%20A22%2C22%200%201%201%20-22%2C101%20C-22%2C89%20-13%2C78%200%2C60%20Z%27%20fill%3D%27%23ff3b4e%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EDIABETES%20CHECK%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Diabetes rarely announces itself. Increased thirst, frequent urination, unexplained weight loss and slow-healing wounds are the classic signs - but many people have none of them until complications appear.

!> A simple fasting blood sugar or HbA1c test, once a year after 30 - earlier if diabetes runs in your family. That is the whole screening programme.

## Reading the numbers

- Fasting sugar **below 100 mg/dl** - normal
- **100 to 125** - prediabetes, the warning zone
- **126 and above** on repeated tests - diabetes

HbA1c gives a three-month average, and is much harder to fool with one careful day of eating before the test.

[photo: lab]

## Prediabetes is the opportunity

> For many people prediabetes is genuinely reversible. It is the only stage at which "you could still turn this around" is literally true.

What works:

- Losing even **five to seven per cent** of body weight
- Walking daily
- Replacing refined carbohydrates with whole grains
- Cutting sugary drinks entirely

## Living well with diabetes

Good control is a long game: medicines, diet, movement, and regular checks of eyes, kidneys and feet.

It is entirely possible to live a full, long life with diabetes. The people who do are the ones who found out early and took it seriously.`,
  },
  {
    title: 'Beating the Gujarat Summer: Heat Stroke Is a Medical Emergency',
    excerpt: 'When body temperature crosses a threshold, sweating stops and organs start failing. Learn the signs and the first response.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Ccircle%20cx%3D%270%27%20cy%3D%270%27%20r%3D%2755%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%2710%27%2F%3E%3Cg%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%279%27%20stroke-linecap%3D%27round%27%3E%3Cpath%20d%3D%27M0%2C-105%20L0%2C-78%27%2F%3E%3Cpath%20d%3D%27M0%2C78%20L0%2C105%27%2F%3E%3Cpath%20d%3D%27M-105%2C0%20L-78%2C0%27%2F%3E%3Cpath%20d%3D%27M78%2C0%20L105%2C0%27%2F%3E%3Cpath%20d%3D%27M-74%2C-74%20L-55%2C-55%27%2F%3E%3Cpath%20d%3D%27M55%2C55%20L74%2C74%27%2F%3E%3Cpath%20d%3D%27M-74%2C74%20L-55%2C55%27%2F%3E%3Cpath%20d%3D%27M55%2C-55%20L74%2C-74%27%2F%3E%3C%2Fg%3E%3Ccircle%20cx%3D%270%27%20cy%3D%270%27%20r%3D%2722%27%20fill%3D%27%23ff3b4e%27%20opacity%3D%270.6%27%2F%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EHEAT%20SAFETY%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `In peak summer, temperatures across Gujarat regularly cross 43 degrees, and every year people die of heat stroke - most of them outdoor workers, the elderly, and people who ignored the early warnings.

## Heat exhaustion comes first

Heavy sweating, weakness, dizziness, nausea, headache, cramps.

At this stage the fix is simple: shade, rest, water with a pinch of salt and sugar - or ORS - and cooling the body with wet cloths.

[photo: community]

## Heat stroke is the emergency

The body's cooling system has failed.

- Skin hot and **dry**; sweating may have stopped
- Temperature above **40 degrees**
- Confusion, staggering, or unconsciousness

!> This is a 108 call, not a glass of water. Move the person into shade and cool them aggressively while you wait - wet sheets, water poured over the body, ice packs at the neck, armpits and groin.

## Prevention, applied consistently

1. Avoid the sun between **12 and 4**.
2. Drink water before you feel thirsty.
3. Wear light cotton, and cover your head.
4. Never leave anyone - child, elderly relative, pet - in a parked car.
5. Check on elderly neighbours during a heat wave.

> Heat stroke is one of the few medical emergencies that is almost entirely preventable by people who are not doctors.`,
  },
  {
    title: 'Organ Donation in India: One Decision, Up to Eight Lives',
    excerpt: 'A single organ donor can save up to eight people and improve dozens of lives. Here is how pledging actually works.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Cpath%20d%3D%27M0%2C72%20C-82%2C20%20-98%2C-38%20-58%2C-64%20C-28%2C-82%20-6%2C-60%200%2C-43%20C6%2C-60%2028%2C-82%2058%2C-64%20C98%2C-38%2082%2C20%200%2C72%20Z%27%20fill%3D%27%23ff3b4e%27%2F%3E%3Cg%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%278%27%20stroke-linecap%3D%27round%27%3E%3Cpath%20d%3D%27M-125%2C95%20C-100%2C68%20-60%2C68%20-35%2C88%27%2F%3E%3Cpath%20d%3D%27M125%2C95%20C100%2C68%2060%2C68%2035%2C88%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EORGAN%20DONATION%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Blood donation saves lives in units; organ donation saves them in whole futures.

> One donor can give a heart, two lungs, a liver that can be split between two patients, two kidneys, a pancreas and intestines - up to eight lives - plus corneas that restore sight and tissue that helps many more.

## The gap is not medical

India's organ donation rate remains among the lowest in the world, while lakhs of patients wait for kidneys and livers. The shortage is not surgical capacity. It is awareness and family consent.

Donation after death typically happens in cases of brain death in a hospital ICU, and doctors will always ask the family.

!> Families say yes far more often when they already know it was the person's wish. The conversation matters more than the card.

[photo: community]

## How to pledge

1. Register online with **NOTTO**, the National Organ and Tissue Transplant Organisation.
2. Tell your family clearly that this is what you want.
3. Tell them again, once, in front of someone else.

## The myths worth retiring

- Donation does **not** disfigure the body; surgery is done with the same care as on a living patient.
- Funeral arrangements are not meaningfully delayed.
- Every major religion in India has voices supporting it as an act of charity.`,
  },
  {
    title: 'Your Mind Matters Too: Recognising Stress Before It Breaks Something',
    excerpt: 'Sleep, appetite, focus, temper - mental strain shows up in the body long before we call it a problem. Small habits help.',
    author: 'Admin',
    imageUrl: 'data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%27900%27%20height%3D%27450%27%20viewBox%3D%270%200%20900%20450%27%3E%3Cdefs%3E%3ClinearGradient%20id%3D%27bg%27%20x1%3D%270%27%20y1%3D%270%27%20x2%3D%271%27%20y2%3D%271%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23241017%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23130a0d%27%2F%3E%3C%2FlinearGradient%3E%3CradialGradient%20id%3D%27halo%27%20cx%3D%270.5%27%20cy%3D%270.45%27%20r%3D%270.5%27%3E%3Cstop%20offset%3D%270%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270.28%27%2F%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ff3b4e%27%20stop-opacity%3D%270%27%2F%3E%3C%2FradialGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%27900%27%20height%3D%27450%27%20fill%3D%27url%28%23bg%29%27%2F%3E%3Ccircle%20cx%3D%27450%27%20cy%3D%27205%27%20r%3D%27230%27%20fill%3D%27url%28%23halo%29%27%2F%3E%3Cpath%20d%3D%27M0%2C395%20L330%2C395%20L345%2C372%20L360%2C412%20L375%2C360%20L392%2C420%20L406%2C395%20L900%2C395%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-opacity%3D%270.35%27%20stroke-width%3D%272.5%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20transform%3D%27translate%28450%2C195%29%27%3E%3Ccircle%20cx%3D%270%27%20cy%3D%27-8%27%20r%3D%2782%27%20fill%3D%27none%27%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%279%27%2F%3E%3Cpath%20d%3D%27M-58%2C-8%20L-24%2C-8%20L-12%2C-26%20L2%2C14%20L14%2C-32%20L26%2C10%20L36%2C-8%20L58%2C-8%27%20fill%3D%27none%27%20stroke%3D%27%23ff3b4e%27%20stroke-width%3D%277%27%20stroke-linejoin%3D%27round%27%20stroke-linecap%3D%27round%27%2F%3E%3Cg%20stroke%3D%27%23ffb0b8%27%20stroke-width%3D%276%27%20stroke-linecap%3D%27round%27%20opacity%3D%270.6%27%3E%3Cpath%20d%3D%27M-120%2C86%20C-90%2C72%20-60%2C72%20-30%2C86%27%2F%3E%3Cpath%20d%3D%27M30%2C86%20C60%2C72%2090%2C72%20120%2C86%27%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3Ctext%20x%3D%27450%27%20y%3D%27340%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-size%3D%2721%27%20font-weight%3D%27bold%27%20letter-spacing%3D%277%27%20fill%3D%27%23f0c9cd%27%3EMIND%20MATTERS%3C%2Ftext%3E%3C%2Fsvg%3E',
    content: `Health platforms talk about blood pressure and sugar, but chronic stress quietly feeds both - and it deserves the same practical attention.

> Stress is not a character flaw. It is a physiological state, and it leaves fingerprints.

## What it looks like

- Poor sleep, or sleep that does not refresh
- Changed appetite, in either direction
- Irritability and a short fuse
- Difficulty concentrating
- Headaches
- A constant background tiredness no amount of chai fixes

[photo: community]

## The basics, which genuinely work

This is why every doctor repeats them.

1. **Sleep** - a consistent seven to eight hours does more for mood than almost anything else.
2. **Movement** - thirty minutes of walking most days measurably reduces anxiety.
3. **Boundaries** - screens out of the bedroom, and a fixed cut-off for work messages.

## Talking, and doing

Talking helps in a way that scrolling does not. A daily conversation with someone you trust is protective.

So is doing one thing regularly that has nothing to do with being productive: gardening, cricket, music, cooking.

## Where self-care stops being enough

!> If low mood or anxiety persists for weeks and disturbs your work or your relationships, that is the point to speak to a doctor or counsellor - exactly as you would for chest pain.

Seeking help early is the strong move, not the weak one.`,
  },
];
