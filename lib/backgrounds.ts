export const HORSE_BACKGROUNDS = [
  "https://image.pollinations.ai/prompt/Chinese%20ink%20painting%20of%20a%20galloping%20horse%20red%20gold%20festive%20background?width=1024&height=1024&seed=101&nologo=true",
  "https://image.pollinations.ai/prompt/Majestic%20horse%20running%20traditional%20Chinese%20art%20red%20atmosphere?width=1024&height=1024&seed=102&nologo=true",
  "https://image.pollinations.ai/prompt/Golden%20horse%20illustration%20Chinese%20New%20Year%20style%20red%20background?width=1024&height=1024&seed=103&nologo=true",
  "https://image.pollinations.ai/prompt/Powerful%20horse%20silhouette%20against%20red%20lanterns%20digital%20art?width=1024&height=1024&seed=104&nologo=true",
  "https://image.pollinations.ai/prompt/Artistic%20Chinese%20horse%20watercolor%20red%20and%20gold%20splash?width=1024&height=1024&seed=105&nologo=true",
  "https://image.pollinations.ai/prompt/Festive%20Lunar%20New%20Year%20horse%20artwork%20glowing%20red?width=1024&height=1024&seed=106&nologo=true",
  "https://image.pollinations.ai/prompt/Dynamic%20horse%20pose%20Chinese%20brush%20style%20celebration?width=1024&height=1024&seed=107&nologo=true",
  "https://image.pollinations.ai/prompt/Elegant%20horse%20standing%20traditional%20pattern%20background%20red?width=1024&height=1024&seed=108&nologo=true",
  "https://image.pollinations.ai/prompt/Abstract%20horse%20concept%20Chinese%20red%20gold%20elements?width=1024&height=1024&seed=109&nologo=true",
  "https://image.pollinations.ai/prompt/Detailed%20illustration%20of%20a%20horse%20Chinese%20mythology%20style?width=1024&height=1024&seed=110&nologo=true"
];

export function getRandomBuiltinBackground(): string {
  return HORSE_BACKGROUNDS[Math.floor(Math.random() * HORSE_BACKGROUNDS.length)];
}
