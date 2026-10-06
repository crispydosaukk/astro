const Astronomy = require('astronomy-engine');

const birthUtc = new Date(Date.UTC(1968, 4, 27, 23, 14, 0));
const time = Astronomy.MakeTime(birthUtc);
const yearsSinceJ2000 = time.ut / 365.25;
const ayanamsha = 23.857092 + yearsSinceJ2000 * 0.0139697;

const gastHours = Astronomy.SiderealTime(time);
const lonDeg = 80.2707;
const latDeg = 13.0827;
const ramcDeg = (((gastHours * 15 + lonDeg) % 360) + 360) % 360;
const ramcRad = (ramcDeg * Math.PI) / 180;
const T = time.ut / 36525.0;
const epsDeg = 23.4392911 - 0.0130042 * T;
const epsRad = (epsDeg * Math.PI) / 180;
const latRad = (latDeg * Math.PI) / 180;
const y = Math.cos(ramcRad);
const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);
let ascTropical = (Math.atan2(y, x) * 180) / Math.PI;
ascTropical = ((ascTropical % 360) + 360) % 360;
const lagnaSidereal = ((ascTropical - ayanamsha + 360) % 360);

const bodies = [
  { name: 'Ascendant', sid: lagnaSidereal },
  { name: 'Sun', sid: ((Astronomy.SunPosition(time).elon - ayanamsha + 360) % 360) },
  { name: 'Moon', sid: ((Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, time, false)).elon - ayanamsha + 360) % 360) },
  { name: 'Mars', sid: ((Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Mars, time, false)).elon - ayanamsha + 360) % 360) },
  { name: 'Mercury', sid: ((Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Mercury, time, false)).elon - ayanamsha + 360) % 360) },
  { name: 'Jupiter', sid: ((Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Jupiter, time, false)).elon - ayanamsha + 360) % 360) },
  { name: 'Venus', sid: ((Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Venus, time, false)).elon - ayanamsha + 360) % 360) },
  { name: 'Saturn', sid: ((Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Saturn, time, false)).elon - ayanamsha + 360) % 360) },
];

const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
const rahuSid = ((((omega % 360) + 360) % 360) - ayanamsha + 360) % 360;
const ketuSid = (rahuSid + 180) % 360;
bodies.push({ name: 'Rahu', sid: rahuSid });
bodies.push({ name: 'Ketu', sid: ketuSid });

const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

console.log('--- ASTRONOMICAL CHART (28 May 1968, 04:44 AM IST, Chennai) ---');
console.log('Ayanamsa (Lahiri):', Math.floor(ayanamsha) + '° ' + Math.floor((ayanamsha * 60) % 60) + "' " + Math.floor((ayanamsha * 3600) % 60) + '"');
for (const b of bodies) {
  const signIdx = Math.floor(b.sid / 30);
  const degInSign = b.sid % 30;
  const d = Math.floor(degInSign);
  const m = Math.floor((degInSign * 60) % 60);
  const s = Math.floor((degInSign * 3600) % 60);
  console.log(b.name.padEnd(12), signs[signIdx].padEnd(12), `${d}° ${m}' ${s}" (Total: ${b.sid.toFixed(4)}°)`);
}
