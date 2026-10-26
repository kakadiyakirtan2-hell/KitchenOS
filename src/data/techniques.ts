import { TechniqueAnimation } from '../types';

export const TECHNIQUES: TechniqueAnimation[] = [
  {
    id: 'tadka-splutter',
    title: 'Tadka Splutter & Tempering',
    hindiTitle: 'तड़का लगाने का सही तरीका',
    category: 'Sizzle & Tadka',
    description: 'Master the art of blooming aromatic whole spices in medium-hot ghee without burning them.',
    visualCue: 'Ghee shimmers, mustard seeds crackle like fireworks, cumin dances, and spices turn fragrant golden amber.',
    keyTips: [
      'Heat ghee until hot but not smoking; test with 2 mustard seeds.',
      'Drop mustard seeds first; wait for the energetic popping sound before adding cumin.',
      'Add hing, ginger, and curry leaves at the very end and immediately pour over the dish to trap aromas.',
      'Keep a lid handy to cover the pan immediately for maximum aroma retention.'
    ],
    soundType: 'sizzle'
  },
  {
    id: 'roti-puff',
    title: 'Phulka & Paratha Steam Puffing',
    hindiTitle: 'गोल फूली हुई रोटी / फुल्का',
    category: 'Tawa & Bread',
    description: 'Learn the exact tawa flip timing and steam pressure needed to puff every roti into a soft golden balloon.',
    visualCue: 'First tiny blisters appear on side 1, side 2 cooks 70%, then flips to flame where trapped steam expands the roti.',
    keyTips: [
      'First side: Cook only 10-15 seconds until tiny pale blisters appear. Do NOT overcook side 1!',
      'Second side: Cook for 25-30 seconds until light golden brown speckles appear across the surface.',
      'Transfer directly to flame or press gently with a soft cloth on the tawa edge to induce the steam puff.',
      'Brush immediately with homemade ghee for stay-soft rotis that remain tender for hours.'
    ],
    soundType: 'puff'
  },
  {
    id: 'chai-simmer',
    title: 'Rolling Boil & Chai Decoction',
    hindiTitle: 'अदरक-इलायची कड़क चाय',
    category: 'Simmer & Boil',
    description: 'Extract deep warmth from crushed ginger and green cardamom through a slow rolling boil before milk addition.',
    visualCue: 'Water turns rich amber red, ginger oils release, milk is added and rises up in 3 consecutive rolling froth waves.',
    keyTips: [
      'Always boil water, crushed fresh ginger, and cardamom for a full 2 minutes BEFORE adding tea leaves.',
      'Add tea leaves and simmer on low for 1 minute to extract color without bitterness.',
      'Add whole milk, bring to a full frothy rise, lower flame, and repeat the rise twice for velvety texture.',
      'Pour from a slight height to aerate and produce a naturally creamy cafe-like top froth.'
    ],
    soundType: 'boil'
  },
  {
    id: 'dosa-spread',
    title: 'Crispy Dosa Spiral & Golden Edge',
    hindiTitle: 'क्रिस्पी डोसा फैलाने की तकनीक',
    category: 'Tawa & Bread',
    description: 'Achieve paper-thin, lace-crisp restaurant style dosas with effortless concentric circular ladle swirls.',
    visualCue: 'Ladle pours batter in the center, glides in smooth spirals outward, steam evaporates, and edges curl up golden.',
    keyTips: [
      'Tawa temperature is critical! Sprinkle water drops; they should sizzle and evaporate immediately, then wipe with a wet cloth.',
      'Pour batter in the dead center and glide the ladle bottom lightly outwards in continuous spiral circles without stopping.',
      'Drizzle melted butter or oil only around the outer circumference and a few drops in the center.',
      'Do not try to lift until the edges turn golden and naturally release from the tawa surface.'
    ],
    soundType: 'sizzle'
  },
  {
    id: 'dough-knead',
    title: 'Silky Soft Atta Kneading Rhythm',
    hindiTitle: 'नरम आटा गूंथने की कला',
    category: 'Dough & Batter',
    description: 'Hydrate the wheat flour step-by-step and develop gluten stretch for pillow-soft rotis and parathas.',
    visualCue: 'Flour crumbs unite with water into a shaggy mass, then continuous heel-of-palm pressing yields a satiny sphere.',
    keyTips: [
      'Add water in 3 separate batches rather than all at once to prevent sticky dough disasters.',
      'Use the heel of your palms to stretch the dough away, fold back, punch with knuckles, and repeat for 4-5 minutes.',
      'Dough is ready when pressing your finger leaves a soft dent that gently springs back.',
      'Smear 1/2 tsp oil/ghee over the ball and rest covered with a damp cloth for 15-20 minutes before rolling.'
    ],
    soundType: 'puff'
  },
  {
    id: 'batter-whisk',
    title: 'Lump-Free Besan & Pakora Batter',
    hindiTitle: 'बेसन का चिकना घोल',
    category: 'Dough & Batter',
    description: 'Whip gram flour into an airy, lump-free batter that coats fritters evenly with a light crispy crunch.',
    visualCue: 'Whisk aerates the bright yellow batter into a glossy, ribbon-stage consistency with tiny air bubbles.',
    keyTips: [
      'Always sift besan or whisk dry first to break any compact lumps before adding liquids.',
      'Add a small splash of hot oil or warm water to the batter for extra crispy pakora crusts.',
      'Whisk vigorously in one direction for 2 minutes to trap air pockets; this makes pakoras light without baking soda.',
      'Check consistency: batter should coat the back of a spoon with an even, velvety layer.'
    ],
    soundType: 'whisk'
  }
];
