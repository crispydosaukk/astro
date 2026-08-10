const fs = require('fs');
const path = require('path');

const remediesDir = path.join(__dirname, 'src', 'app', 'remedies');
const remedies = ['charity', 'fasting', 'gemstone', 'homa', 'ishta-devata', 'mantra', 'muhurtham', 'rudraksha', 'vastu', 'yantra'];

const imageMap = {
  'gemstone': '/assets/images/remedies/remedies_gemstone_1785738400359.png',
  'mantra': '/assets/images/remedies/remedies_mantra_1785738410624.png',
  'yantra': '/assets/images/remedies/remedies_yantra_1785738431966.png',
  'homa': '/assets/images/remedies/remedies_homam_1785738443734.png',
  'ishta-devata': '/assets/images/remedies/remedies_ishta_1785738453810.png',
  'muhurtham': '/assets/images/remedies/remedies_muhurtham_1785738473891.png',
  'vastu': '/assets/images/remedies/remedies_vastu_1785738485180.png',
  'charity': '/assets/images/remedies/remedies_charity_1785738494717.png',
  'rudraksha': '/assets/images/remedies/remedies_homam_1785738443734.png',
  'fasting': '/assets/images/remedies/remedies_homam_1785738443734.png', // Fallback
};

for (const remedy of remedies) {
  const pagePath = path.join(remediesDir, remedy, 'page.tsx');
  if (!fs.existsSync(pagePath)) continue;

  let content = fs.readFileSync(pagePath, 'utf8');

  // Add next/image import if missing
  if (!content.includes("import Image from 'next/image';")) {
    content = content.replace("import Link from 'next/link';", "import Link from 'next/link';\nimport Image from 'next/image';");
  }

  // Find the icon used in the hero (from the tag button)
  const tagIconMatch = content.match(/<([A-Za-z0-9]+)\s+size=\{12\}/);
  const tagIcon = tagIconMatch ? tagIconMatch[1] : 'Star'; // fallback

  // Find the primary button icon
  const primaryIconMatch = content.match(/<([A-Za-z0-9]+)\s+size=\{16\}[^>]*>\s*\{\s*content\.hero\.primaryBtnText\s*\}/);
  const primaryIcon = primaryIconMatch ? primaryIconMatch[1] : tagIcon;

  // Extract the breadcrumbs
  const breadcrumbMatch = content.match(/<div className="flex items-center gap-2 text-sm text-white\/50 mb-6">([\s\S]*?)<\/div>\s*<div className="grid lg:grid-cols-2/);
  const breadcrumbs = breadcrumbMatch ? breadcrumbMatch[1] : '';
  
  // Extract the title name for alt tag (from breadcrumb or default)
  const breadcrumbTextMatch = breadcrumbs.match(/<span className="text-\[#C9952B\]">([^<]+)<\/span>/);
  const remedyNameTitle = breadcrumbTextMatch ? breadcrumbTextMatch[1] : remedy;

  const newHero = `      {/* Hero */}
      <section className="relative min-h-screen overflow-hidden border-b border-white/5 flex flex-col pt-20 lg:pt-0 bg-background">
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="max-w-[2000px] w-full mx-auto">
            <div className="grid lg:grid-cols-2 items-center min-h-screen">
              
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="px-6 lg:px-12 xl:px-20 space-y-8 py-20 lg:py-0 order-2 lg:order-1"
              >
                <div className="flex items-center gap-2 text-sm text-white/50 mb-6">
                  ${breadcrumbs.trim()}
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold glass-card border border-[#C9952B]/30 text-[#C9952B] mb-5">
                    <${tagIcon} size={12} /> {content.hero.tag}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-6 tracking-tight leading-tight">
                    {content.hero.titleLine1}
                    <br />
                    <span className="text-gradient-gold">{content.hero.titleLine2}</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {content.hero.description}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-8">
                    <a
                      href="#get-report"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold gold-gradient-bg text-white hover:opacity-90 transition-all gold-shadow"
                    >
                      <${primaryIcon} size={16} /> {content.hero.primaryBtnText}
                    </a>
                    <Link
                      href="/talk-to-astrologer"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold glass-card border border-white/20 text-white hover:border-[#C9952B]/50 hover:text-[#C9952B] transition-all"
                    >
                      {content.hero.secondaryBtnText}
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Right Visual */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="relative h-[40vh] lg:h-screen w-full order-1 lg:order-2"
              >
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent lg:bg-gradient-to-r lg:from-background lg:via-background/20 lg:to-transparent" />
                <Image
                  src="${imageMap[remedy]}"
                  alt="${remedyNameTitle}"
                  fill
                  className="object-cover lg:object-right"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>`;

  // Replace old hero section
  const oldHeroRegex = /\{\/\*\s*Hero\s*\*\/\}\s*<section className="relative pt-24 py-20 cosmic-bg overflow-hidden">[\s\S]*?<\/section>/;
  if (oldHeroRegex.test(content)) {
    content = content.replace(oldHeroRegex, newHero);
    fs.writeFileSync(pagePath, content);
    console.log('Updated ' + remedy);
  } else {
    console.log('Hero section not found in ' + remedy);
  }
}
