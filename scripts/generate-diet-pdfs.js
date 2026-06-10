import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../public/diet-plans');

// Real contact details from drdeepikagyno.in
const CLINIC = {
  doctor: 'Dr. Deepika Singh',
  title: 'Senior Consultant Gynecologist & Obstetrician',
  qualifications: 'MD (AIIMS) | FCLS | MCCOG | FOGSI | IFS | RCOG',
  address: 'F-11, South Extension Part 1, New Delhi - 110049',
  phone: '+91 85959 54095',
  whatsapp: '+91 85959 54095',
  email: 'drdipikasingh2026@gmail.com',
  hours: 'Mon - Sat: 10 AM - 8 PM | Sun: 10 AM - 6 PM',
  website: 'drdeepikagyno.in',
  experience: '15+ Years',
  patients: '20,000+ Happy Patients',
};

const C = {
  teal: '#0d9488',
  tealDark: '#0f766e',
  tealLight: '#ccfbf1',
  tealBg: '#f0fdfa',
  dark: '#0f172a',
  slate: '#475569',
  muted: '#64748b',
  light: '#f8fafc',
  white: '#ffffff',
  amber: '#fffbeb',
  amberBorder: '#fbbf24',
  amberText: '#92400e',
  green: '#dcfce7',
  greenBorder: '#22c55e',
  greenDark: '#166534',
  red: '#fef2f2',
  redBorder: '#fca5a5',
  redDark: '#991b1b',
  tealGreen: '#25D366',
  border: '#e2e8f0',
};

// ============================================
// MEAL PLAN DATA
// ============================================

const PLANS = {
  pcos: {
    title: 'PCOS Diet Plan',
    subtitle: 'Low-GI, Anti-Inflammatory Diet for Hormonal Balance',
    principles: [
      'Focus on low-glycemic index (GI) foods — choose whole grains, millets, and legumes over refined carbs.',
      'Include high-fibre vegetables, lean proteins, and healthy fats (nuts, seeds, avocado) at every meal.',
      'Avoid sugar, refined flour (maida), sugary beverages, and processed snacks that spike insulin levels.',
      'Add anti-inflammatory spices daily: turmeric, cinnamon, ginger, and fenugreek.',
      'Drink 8-10 glasses of water, herbal teas, and fenugreek seed water throughout the day.',
      'Eat small, frequent meals every 3-4 hours. Limit dairy and red meat.',
    ],
    veg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: 'Moong dal cheela (2) + mint chutney + 1 cup green tea', Lunch: '1 cup brown rice + \u00BD cup rajma + cucumber salad', Snack: 'Roasted makhana (1 cup) + 1 apple', Dinner: '2 jowar roti + \u00BD cup lauki sabzi + \u00BD cup dal' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Overnight oats (oats + flaxseeds + almond milk) + 5 almonds', Lunch: '2 whole wheat roti + \u00BD cup palak paneer + \u00BD cup curd', Snack: '1 cup sprouts bhel with lemon juice', Dinner: '\u00BD cup quinoa + \u00BD cup chana curry + green salad' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Vegetable poha (1 cup) + \u00BD cup sprouts + mint tea', Lunch: '1 cup rajma + \u00BD cup brown rice + cucumber raita', Snack: '1 guava + 5-6 almonds', Dinner: '2 ragi roti + \u00BD cup bhindi sabzi + \u00BD cup dal' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + coconut chutney', Lunch: '\u00BD cup chickpea curry + 1 cup brown rice + salad', Snack: 'Roasted chana (\u00BD cup) + green tea', Dinner: '2 multigrain roti + \u00BD cup methi sabzi + \u00BD cup curd' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Besan cheela (2) + pudina chutney + 1 cup ginger tea', Lunch: '1 cup mixed dal khichdi + \u00BD cup raita + pickle', Snack: '1 pear + 5-6 walnuts', Dinner: '2 bajra roti + \u00BD cup tinda sabzi + \u00BD cup dal' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Idli (2) + \u00BD cup sambar + coconut chutney', Lunch: '1 cup brown rice + \u00BD cup sambar + \u00BD cup curd', Snack: 'Fruit salad (1 cup mixed seasonal fruits)', Dinner: '2 soya roti + \u00BD cup capsicum sabzi + \u00BD cup dal' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Oats upma (1 cup) + 1 tbsp flaxseed powder + green tea', Lunch: 'Paneer tikka (100g) + 2 roti + mint chutney + salad', Snack: '1 cup makhana + 1 cup green tea', Dinner: 'Vegetable soup + 1 cup quinoa pulao + raita' } },
      ],
      include: ['Moong dal, chana, rajma, chickpeas, toor dal', 'Brown rice, quinoa, jowar, bajra, ragi, oats', 'Palak, methi, lauki, tinda, bhindi, capsicum', 'Apple, guava, pear, berries, pomegranate', 'Almonds, walnuts, flaxseeds, chia seeds, makhana', 'Turmeric, cinnamon, ginger, fenugreek seeds, cumin'],
      avoid: ['White rice, maida, white bread, pasta, sooji', 'Sugar, sweets, cakes, biscuits, sugary drinks', 'Potatoes, corn, sweet potatoes (high GI)', 'Full-fat dairy, processed cheese, red meat', 'Packaged snacks, fried foods, junk food', 'Excess caffeine, alcohol, aerated drinks'],
    },
    nonveg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: '2 boiled eggs + 1 slice brown bread + 1 cup green tea', Lunch: 'Grilled fish (100g) + 1 cup brown rice + saut\u00E9ed veggies', Snack: 'Roasted makhana (1 cup) + 1 apple', Dinner: '2 jowar roti + \u00BD cup lauki sabzi + 1 boiled egg' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Overnight oats (oats + flaxseeds + almond milk) + 5 almonds', Lunch: 'Grilled chicken (100g) + \u00BD cup quinoa + cucumber salad', Snack: '1 cup sprouts bhel with lemon', Dinner: '2 whole wheat roti + \u00BD cup palak + \u00BD cup fish curry' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Egg white omelette (3 eggs + spinach) + 1 slice toast', Lunch: 'Chicken curry (100g) + 1 cup brown rice + raita', Snack: '1 guava + 5-6 almonds', Dinner: 'Grilled fish + \u00BD cup stir-fried veggies + 1 roti' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + 2 boiled egg whites', Lunch: 'Egg curry (2 eggs) + 1 cup brown rice + salad', Snack: 'Roasted chana (\u00BD cup) + green tea', Dinner: '2 multigrain roti + \u00BD cup methi sabzi + grilled chicken' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Besan cheela (2) + 1 boiled egg + ginger tea', Lunch: 'Fish curry (100g) + 1 cup brown rice + \u00BD cup raita', Snack: '1 pear + 5-6 walnuts', Dinner: 'Chicken soup + \u00BD cup dal + 1 roti' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Idli (2) + \u00BD cup sambar + 2 boiled egg whites', Lunch: 'Grilled chicken salad + 1 cup quinoa + curd', Snack: 'Fruit salad (1 cup mixed seasonal fruits)', Dinner: 'Baked fish (100g) + saut\u00E9ed spinach + 1 roti' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Oats upma (1 cup) + 1 tbsp flaxseed + 2 egg whites', Lunch: 'Tandoori chicken (150g) + mint chutney + salad', Snack: '1 cup makhana + green tea', Dinner: 'Chicken stew + veggies + \u00BD cup brown rice' } },
      ],
      include: ['Chicken breast, fish (salmon, mackerel), eggs', 'Brown rice, quinoa, jowar, bajra, ragi, oats', 'Palak, methi, lauki, tinda, bhindi, broccoli', 'Apple, guava, pear, berries, pomegranate', 'Almonds, walnuts, flaxseeds, chia seeds, makhana', 'Turmeric, cinnamon, ginger, fenugreek, cumin'],
      avoid: ['White rice, maida, white bread, pasta, noodles', 'Sugar, sweets, cakes, biscuits, sugary drinks', 'Potatoes, corn, sweet potatoes', 'Red meat (limit), processed meats, full-fat dairy', 'Packaged snacks, fried foods, junk food', 'Excess caffeine, alcohol, aerated drinks'],
    },
  },
  pregnancy: {
    title: 'Pregnancy Diet Plan',
    subtitle: 'Nutrient-Dense Diet for Maternal Health & Fetal Development',
    principles: [
      'Ensure adequate folate, iron, calcium, protein, and DHA for healthy fetal brain and spine development.',
      'Eat small, frequent meals every 2-3 hours to manage nausea, heartburn, and maintain stable energy.',
      'Pair iron-rich foods (green leafy veg, lentils, beetroot) with vitamin C (lemon, amla) for absorption.',
      'Stay hydrated with 8-10 glasses of water, coconut water, buttermilk, and fresh fruit juices daily.',
      'Avoid raw/undercooked meats, raw eggs, unpasteurized dairy, excess caffeine, and alcohol completely.',
      'Take prescribed prenatal supplements (folic acid, iron, calcium, DHA) as advised by your doctor.',
    ],
    veg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: 'Moong dal chilla (2) + mint chutney + 1 glass milk', Lunch: '2 roti + \u00BD cup palak paneer + \u00BD cup dal + salad', Snack: '1 banana + 5 soaked almonds + 1 glass buttermilk', Dinner: '1 cup brown rice + \u00BD cup chana curry + raita' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Oats porridge + chopped nuts + dates + 1 cup milk', Lunch: '2 multigrain roti + \u00BD cup soya chunk curry + \u00BD cup curd', Snack: '1 apple + 1 tbsp peanut butter + herbal tea', Dinner: '1 cup dal khichdi + ghee + \u00BD cup raita + pickle' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + coconut chutney', Lunch: '2 roti + \u00BD cup bhindi sabzi + \u00BD cup dal + salad', Snack: '1 cup pomegranate + 1 glass milk', Dinner: '1 cup veg pulao + \u00BD cup curd + cucumber salad' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Brown bread upma + 1 glass milk + 1 orange', Lunch: '2 roti + \u00BD cup matar paneer + \u00BD cup dal + raita', Snack: '1 cup fruit custard + 5-6 almonds', Dinner: '1 cup veg khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Idli (3) + \u00BD cup sambar + coconut chutney + milk', Lunch: '2 roti + \u00BD cup lauki chana dal + \u00BD cup curd + salad', Snack: '1 guava + 1 glass buttermilk', Dinner: '1 cup brown rice + \u00BD cup dal + \u00BD cup sabzi' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Vegetable poha (1 cup) + 1 glass milk + 1 pear', Lunch: '2 roti + \u00BD cup paneer bhurji + \u00BD cup dal + salad', Snack: '1 cup yogurt + mixed nuts + honey', Dinner: '1 cup quinoa + \u00BD cup chole + \u00BD cup curd' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Besan chilla (2) + green chutney + 1 glass milk', Lunch: '2 roti + \u00BD cup aloo gobi + \u00BD cup dal + raita', Snack: '1 cup mixed fruit salad + 1 glass milk', Dinner: '1 cup veg pulao + \u00BD cup raita + salad' } },
      ],
      include: ['Palak, methi, lauki, carrot, beetroot, sweet potato', 'Moong dal, chana, toor dal, soya chunks, paneer', 'Milk, curd, buttermilk, paneer (pasteurized dairy)', 'Brown rice, ragi, jowar, bajra, whole wheat, oats', 'Almonds, walnuts, dates, figs, raisins, flaxseeds', 'Lemon, amla, orange, guava, pomegranate, banana'],
      avoid: ['Raw eggs, unpasteurized milk, soft cheese', 'Raw sprouts, uncooked salads from outside', 'Excess caffeine (max 1 cup tea/coffee per day)', 'Alcohol, smoking, tobacco in any form', 'Fried foods, junk food, processed meats', 'Raw papaya, excess pineapple'],
    },
    nonveg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: '2 boiled eggs + 1 slice brown toast + 1 glass milk', Lunch: '2 roti + fish curry (100g) + \u00BD cup sabzi + salad', Snack: '1 banana + 5 almonds + 1 glass buttermilk', Dinner: '1 cup brown rice + \u00BD cup dal + raita' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Oats porridge + nuts + dates + 1 cup milk', Lunch: '2 multigrain roti + chicken curry (100g) + \u00BD cup curd', Snack: '1 apple + 1 tbsp peanut butter + herbal tea', Dinner: '1 cup dal khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + 1 boiled egg', Lunch: '2 roti + \u00BD cup sabzi + \u00BD cup fish curry + salad', Snack: '1 cup pomegranate + 1 glass milk', Dinner: '1 cup veg pulao + \u00BD cup curd + cucumber salad' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Egg sandwich (brown bread, 1 egg) + 1 glass milk + orange', Lunch: '2 roti + chicken stew (100g) + \u00BD cup dal + raita', Snack: '1 cup fruit custard + 5-6 almonds', Dinner: '1 cup veg khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Idli (3) + \u00BD cup sambar + 1 boiled egg + milk', Lunch: '2 roti + \u00BD cup sabzi + \u00BD cup dal + \u00BD cup curd', Snack: '1 guava + 1 glass buttermilk', Dinner: 'Grilled fish (100g) + \u00BD cup brown rice + saut\u00E9ed spinach' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Vegetable poha (1 cup) + 1 glass milk + 1 pear', Lunch: '2 roti + egg curry (2 eggs) + \u00BD cup dal + salad', Snack: '1 cup yogurt + mixed nuts + honey', Dinner: '1 cup quinoa + chicken curry (100g) + \u00BD cup curd' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: '2 besan chilla + 1 boiled egg + 1 glass milk', Lunch: '2 roti + fish tikka (100g) + mint chutney + salad + raita', Snack: '1 cup mixed fruit + 1 glass milk', Dinner: 'Chicken soup + \u00BD cup brown rice + saut\u00E9ed veggies' } },
      ],
      include: ['Well-cooked chicken, fish (salmon, mackerel), eggs', 'Milk, curd, buttermilk, paneer (pasteurized dairy)', 'Palak, methi, lauki, carrot, beetroot, broccoli', 'Brown rice, ragi, jowar, bajra, whole wheat, oats', 'Almonds, walnuts, dates, figs, flaxseeds', 'Lemon, amla, orange, guava, pomegranate, banana'],
      avoid: ['Raw/undercooked meat, high-mercury fish', 'Raw eggs, unpasteurized milk, soft cheese', 'Excess caffeine, alcohol, smoking', 'Fried foods, junk food, processed meats', 'Raw sprouts, uncooked salads from outside', 'Raw papaya, excess pineapple'],
    },
  },
  weightloss: {
    title: 'Weight Loss Diet Plan',
    subtitle: 'High-Protein, Low-Carb Diet for Healthy Fat Loss',
    principles: [
      'Create a moderate calorie deficit (1200-1500 kcal/day) while maintaining protein to preserve muscle mass.',
      'Include lean protein at every meal — dal, paneer, soya, chicken, fish, eggs — to boost metabolism.',
      'Replace refined carbs with complex carbs: brown rice, quinoa, millets, whole wheat, high-fibre veggies.',
      'Avoid sugar, sugary drinks, packaged snacks, fried foods, and all refined flour products completely.',
      'Drink 8-10 glasses of water daily including 1 glass before meals to reduce overeating.',
      'Eat every 3-4 hours with portion control. Dinner should be the lightest meal, 2 hours before bed.',
    ],
    veg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: 'Moong dal cheela (2) + mint chutney + 1 cup green tea', Lunch: '1 cup brown rice + \u00BD cup toor dal + cucumber salad', Snack: '1 cup roasted makhana + green tea', Dinner: '2 jowar roti + \u00BD cup lauki sabzi + \u00BD cup curd' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Oats porridge (water) + 1 tbsp flaxseed + 5 almonds', Lunch: '2 whole wheat roti + \u00BD cup palak paneer + salad', Snack: '1 apple + 5-6 walnuts', Dinner: '1 cup dal khichdi + \u00BD cup raita' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Vegetable poha (1 cup) + \u00BD cup sprouts + lemon', Lunch: '1 cup quinoa + \u00BD cup chana curry + cucumber raita', Snack: '1 guava + green tea', Dinner: '2 ragi roti + \u00BD cup bhindi sabzi + \u00BD cup dal' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + coconut chutney', Lunch: '\u00BD cup soya chunk curry + 1 cup brown rice + salad', Snack: 'Roasted chana (\u00BD cup) + green tea', Dinner: '2 multigrain roti + \u00BD cup methi sabzi + \u00BD cup curd' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Besan cheela (2) + mint chutney + ginger tea', Lunch: '1 cup mixed vegetable soup + 1 cup dal khichdi', Snack: '1 pear + 5-6 almonds', Dinner: 'Paneer tikka (75g) + 1 roti + grilled veggies' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Idli (2) + \u00BD cup sambar + coconut chutney', Lunch: '1 cup brown rice + \u00BD cup sambar + \u00BD cup curd', Snack: '1 cup cucumber-carrot sticks + hummus', Dinner: '2 soya roti + \u00BD cup capsicum sabzi + \u00BD cup dal' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Oats upma (1 cup) + 1 tbsp chia seeds + green tea', Lunch: '1 cup veg pulao (brown rice) + \u00BD cup raita + salad', Snack: '1 cup makhana + green tea', Dinner: 'Vegetable soup + 1 cup quinoa + \u00BD cup dal' } },
      ],
      include: ['Moong dal, chana, toor dal, soya chunks, paneer', 'Brown rice, quinoa, jowar, bajra, ragi, oats', 'Palak, methi, lauki, bhindi, capsicum, gourd family', 'Apple, guava, pear, berries, pomegranate', 'Almonds, walnuts, flaxseeds, chia seeds, makhana', 'Green tea, lemon water, jeera water, buttermilk'],
      avoid: ['White rice, maida, white bread, pasta, noodles', 'Sugar, sweets, chocolates, cakes, biscuits, ice cream', 'Potatoes, sweet potatoes, corn, yam', 'Fried foods, pakoras, chips, samosas, junk food', 'Sugary drinks, packaged juices, alcohol', 'Full-fat dairy, butter, cream, red meat'],
    },
    nonveg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: '2 boiled eggs + 1 slice brown toast + green tea', Lunch: 'Grilled chicken (100g) + 1 cup brown rice + cucumber salad', Snack: '1 cup roasted makhana + green tea', Dinner: '2 jowar roti + \u00BD cup lauki sabzi + 1 boiled egg' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Oats porridge (water) + 1 tbsp flaxseed + 5 almonds', Lunch: 'Grilled fish (100g) + 2 roti + \u00BD cup sabzi + salad', Snack: '1 apple + 5-6 walnuts', Dinner: '1 cup dal khichdi + \u00BD cup raita' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Egg white omelette (3 eggs + spinach) + 1 toast', Lunch: '1 cup quinoa + chicken curry (100g) + cucumber raita', Snack: '1 guava + green tea', Dinner: 'Grilled chicken breast (100g) + saut\u00E9ed broccoli' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + 2 boiled egg whites', Lunch: 'Fish curry (100g) + 1 cup brown rice + salad', Snack: 'Roasted chana (\u00BD cup) + green tea', Dinner: '2 multigrain roti + \u00BD cup methi sabzi + chicken' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: '2 eggs sunny side up + 1 slice toast + ginger tea', Lunch: 'Chicken soup + grilled chicken salad + 1 roti', Snack: '1 pear + 5-6 almonds', Dinner: 'Baked fish (100g) + grilled veggies + 1 roti' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Idli (2) + \u00BD cup sambar + 1 boiled egg', Lunch: '1 cup brown rice + egg curry (2 eggs) + \u00BD cup curd', Snack: 'Cucumber-carrot sticks + hung curd dip', Dinner: '2 soya roti + \u00BD cup sabzi + grilled chicken' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Oats upma (1 cup) + 1 tbsp chia seeds + 2 egg whites', Lunch: 'Tandoori chicken (150g) + mint chutney + salad', Snack: '1 cup makhana + green tea', Dinner: 'Chicken soup + 1 cup quinoa + saut\u00E9ed veggies' } },
      ],
      include: ['Chicken breast, fish (salmon, tuna, mackerel), eggs', 'Brown rice, quinoa, jowar, bajra, ragi, oats', 'Broccoli, spinach, capsicum, lauki, methi, bhindi', 'Apple, guava, pear, berries, pomegranate', 'Almonds, walnuts, flaxseeds, chia seeds, makhana', 'Green tea, lemon water, black coffee (no sugar)'],
      avoid: ['White rice, maida, white bread, pasta, noodles', 'Sugar, sweets, chocolates, cakes, biscuits', 'Potatoes, sweet potatoes, corn', 'Fried foods, chips, samosas, junk food', 'Sugary drinks, packaged juices, alcohol', 'Red meat (limit), processed meats, full-fat dairy'],
    },
  },
  postnatal: {
    title: 'Postnatal Diet Plan',
    subtitle: 'Nutrient-Rich Diet for Post-Delivery Recovery & Breastfeeding Support',
    principles: [
      'Focus on iron-rich and calcium-rich foods to replenish nutrients lost during delivery and support lactation.',
      'Include galactagogues daily: fenugreek (methi), fennel seeds (saunf), oats, garlic, and gond laddoo.',
      'Eat 5-6 small meals daily with adequate protein and healthy fats for breastfeeding energy needs.',
      'Stay well-hydrated with 10-12 glasses of water, coconut water, buttermilk, and herbal teas daily.',
      'Prefer warm, easily digestible foods like khichdi, soups, dalia, and porridge in the early weeks.',
      'Avoid cold foods, gas-forming foods (cabbage, cauliflower), raw salads, and spicy/oily foods initially.',
    ],
    veg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: 'Ragi porridge + 1 tbsp ghee + 5 soaked almonds + dates', Lunch: '2 roti + \u00BD cup lauki chana dal + \u00BD cup curd + salad', Snack: '1 cup fenugreek tea + 1 gond laddoo + 1 banana', Dinner: '1 cup moong dal khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: 'Moong dal chilla (2) + mint chutney + 1 glass milk', Lunch: '2 roti + \u00BD cup palak paneer + \u00BD cup dal + salad', Snack: '1 cup coconut water + 1 methi laddoo + 1 apple', Dinner: 'Dalia (broken wheat) porridge + ghee + \u00BD cup curd' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Oats porridge + milk + 1 tbsp flaxseed + 1 tbsp ghee', Lunch: '1 cup brown rice + \u00BD cup sambar + \u00BD cup curd', Snack: '1 glass warm milk + haldi + 1 piece sukhadi', Dinner: '2 roti + \u00BD cup tinda sabzi + \u00BD cup dal' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: 'Besan chilla (2) + green chutney + 1 glass milk', Lunch: '2 roti + \u00BD cup soya chunk curry + \u00BD cup raita + salad', Snack: '1 glass buttermilk + jeera + 1 banana + 5 almonds', Dinner: '1 cup veg khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Dalia + milk + jaggery + nuts + 1 tbsp ghee', Lunch: '2 roti + \u00BD cup chana curry + \u00BD cup curd + salad', Snack: '1 cup fenugreek tea + 1 gond laddoo + 1 pear', Dinner: '1 cup brown rice + \u00BD cup moong dal + saut\u00E9ed palak' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + coconut chutney', Lunch: '2 roti + \u00BD cup paneer bhurji + \u00BD cup dal + salad', Snack: '1 glass warm milk + 1 tbsp shatavari powder', Dinner: '1 cup dal khichdi + ghee + \u00BD cup curd' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Idli (3) + \u00BD cup sambar + 1 glass milk + chutney', Lunch: '2 roti + \u00BD cup matar paneer + \u00BD cup dal + raita', Snack: '1 cup mixed fruit salad + nuts + seeds', Dinner: '1 cup veg pulao + \u00BD cup raita + salad' } },
      ],
      include: ['Ragi, oats, dalia, moong dal, chana, soya chunks', 'Palak, methi, lauki, tinda, carrot, beetroot', 'Milk, curd, buttermilk, paneer, ghee (in moderation)', 'Almonds, walnuts, dates, figs, raisins, sesame seeds', 'Fenugreek, fennel seeds, cumin, ginger, garlic', 'Coconut water, herbal teas, warm soups, khichdi'],
      avoid: ['Raw salads, raw vegetables in initial weeks', 'Cabbage, cauliflower, broccoli (gas-forming)', 'Cold drinks, ice cream, refrigerated foods', 'Spicy, oily, fried foods, junk food', 'Excess caffeine, alcohol, smoking', 'Packaged snacks, processed foods, preservatives'],
    },
    nonveg: {
      days: [
        { day: 'Day 1 (Monday)', meals: { Breakfast: 'Ragi porridge + ghee + 2 boiled eggs + 5 almonds', Lunch: '2 roti + \u00BD cup lauki sabzi + fish curry (100g) + curd', Snack: '1 cup fenugreek tea + 1 gond laddoo + 1 banana', Dinner: '1 cup moong dal khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 2 (Tuesday)', meals: { Breakfast: '2 moong dal chilla + mint chutney + 1 glass milk', Lunch: '2 roti + \u00BD cup palak sabzi + chicken curry (100g) + curd', Snack: '1 cup coconut water + 1 methi laddoo + 1 apple', Dinner: 'Dalia porridge + ghee + \u00BD cup curd' } },
        { day: 'Day 3 (Wednesday)', meals: { Breakfast: 'Oats porridge + milk + 1 tbsp flaxseed + 2 boiled eggs', Lunch: '1 cup brown rice + fish curry (100g) + \u00BD cup curd', Snack: '1 glass warm milk + haldi + 1 piece sukhadi', Dinner: '2 roti + \u00BD cup tinda sabzi + chicken soup' } },
        { day: 'Day 4 (Thursday)', meals: { Breakfast: '2 besan chilla + green chutney + 1 boiled egg + milk', Lunch: '2 roti + \u00BD cup sabzi + egg curry (2 eggs) + raita', Snack: '1 glass buttermilk + 1 banana + 5 almonds', Dinner: '1 cup veg khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 5 (Friday)', meals: { Breakfast: 'Dalia + milk + jaggery + nuts + 1 boiled egg', Lunch: '2 roti + \u00BD cup sabzi + \u00BD cup fish curry + curd', Snack: '1 cup fenugreek tea + 1 gond laddoo + 1 pear', Dinner: '1 cup brown rice + \u00BD cup dal + saut\u00E9ed palak' } },
        { day: 'Day 6 (Saturday)', meals: { Breakfast: 'Ragi dosa (2) + \u00BD cup sambar + 1 boiled egg', Lunch: '2 roti + \u00BD cup sabzi + chicken stew (100g) + \u00BD cup curd', Snack: '1 glass warm milk + 1 tbsp shatavari powder', Dinner: '1 cup dal khichdi + ghee + \u00BD cup raita' } },
        { day: 'Day 7 (Sunday)', meals: { Breakfast: 'Idli (3) + \u00BD cup sambar + 1 glass milk + 1 boiled egg', Lunch: '2 roti + \u00BD cup sabzi + fish tikka (100g) + mint chutney', Snack: '1 cup mixed fruit + nuts + seeds', Dinner: 'Bone broth soup + 1 cup dal khichdi + ghee' } },
      ],
      include: ['Well-cooked chicken, fish (salmon, mackerel), eggs', 'Bone broth, fish curry, chicken stew, egg curry', 'Ragi, oats, dalia, moong dal, brown rice', 'Palak, methi, lauki, tinda, carrot, beetroot', 'Milk, curd, ghee, almonds, dates, fenugreek', 'Fenugreek, fennel, cumin, ginger, garlic, shatavari'],
      avoid: ['Raw/undercooked meat, raw fish', 'Cabbage, cauliflower, broccoli (gas-forming)', 'Cold drinks, ice cream, refrigerated foods', 'Spicy, oily, fried foods, junk food', 'Excess caffeine, alcohol, smoking', 'Packaged snacks, processed foods, preservatives'],
    },
  },
};

const FILE_NAMES = {
  pcos: { veg: 'PCOS-Diet-Plan-Vegetarian.pdf', nonveg: 'PCOS-Diet-Plan-Non-Vegetarian.pdf' },
  pregnancy: { veg: 'Pregnancy-Diet-Plan-Vegetarian.pdf', nonveg: 'Pregnancy-Diet-Plan-Non-Vegetarian.pdf' },
  weightloss: { veg: 'Weight-Loss-Diet-Plan-Vegetarian.pdf', nonveg: 'Weight-Loss-Diet-Plan-Non-Vegetarian.pdf' },
  postnatal: { veg: 'Postnatal-Diet-Plan-Vegetarian.pdf', nonveg: 'Postnatal-Diet-Plan-Non-Vegetarian.pdf' },
};

// ============================================
// PDF HELPERS
// ============================================

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const FOOTER_Y = PAGE_H - MARGIN - 10;           // 791.89
const BREAK_Y = FOOTER_Y - 14;                   // 777.89

function addPageIfNeeded(doc, neededSpace) {
  if (doc.y + neededSpace > BREAK_Y) {
    addFooter(doc);
    doc.addPage();
    drawPageHeader(doc);
    return true;
  }
  return false;
}

function drawPageHeader(doc) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.teal)
    .text(CLINIC.doctor, MARGIN, 25, { align: 'center', width: CONTENT_W });
  doc.fontSize(6.5).font('Helvetica').fillColor(C.slate)
    .text(CLINIC.website, MARGIN, 37, { align: 'center', width: CONTENT_W });
  doc.moveTo(MARGIN, 47).lineTo(PAGE_W - MARGIN, 47)
    .lineWidth(0.5).strokeColor(C.teal).stroke();
  doc.y = 52;
}

function drawHeader(doc) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor(C.teal)
    .text(CLINIC.doctor, MARGIN, 20, { align: 'center', width: CONTENT_W });

  doc.fontSize(7.5).font('Helvetica').fillColor(C.slate)
    .text(`${CLINIC.title}  |  ${CLINIC.qualifications}`, MARGIN, 37, { align: 'center', width: CONTENT_W });

  doc.moveTo(MARGIN, 50).lineTo(PAGE_W - MARGIN, 50)
    .lineWidth(1.5).strokeColor(C.teal).stroke();

  doc.y = 56;
}

function addFooter(doc) {
  doc.fontSize(6.5).font('Helvetica').fillColor(C.muted);
  doc.text(`\u00A9 2026 ${CLINIC.doctor}. All rights reserved. | ${CLINIC.website}`, MARGIN, FOOTER_Y, { align: 'center', width: CONTENT_W });
}

function textHeight(text, width, fontSize) {
  const charsPerLine = Math.floor(width / (fontSize * 0.5));
  const lines = Math.ceil(text.length / Math.max(charsPerLine, 1));
  return lines * (fontSize * 1.35);
}

function drawTitleBlock(doc, title, subtitle, dietLabel) {
  doc.fontSize(14).font('Helvetica-Bold').fillColor(C.dark)
    .text(`${title} (${dietLabel})`, MARGIN, doc.y, { align: 'center', width: CONTENT_W });
  doc.y += 13;
  doc.fontSize(7.5).font('Helvetica-Oblique').fillColor(C.muted)
    .text(subtitle, MARGIN, doc.y, { align: 'center', width: CONTENT_W });
  doc.y += 12;
}

function drawSectionHeading(doc, text) {
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.tealDark)
    .text(text, MARGIN, doc.y, { align: 'left', width: CONTENT_W });
  doc.moveTo(MARGIN, doc.y + 12).lineTo(MARGIN + 55, doc.y + 12)
    .lineWidth(1.5).strokeColor(C.teal).stroke();
  doc.y += 15;
}

function drawPrinciples(doc, principles) {
  doc.fontSize(7.5).font('Helvetica').fillColor(C.slate);
  for (const p of principles) {
    doc.text(`\u2022  ${p}`, MARGIN + 2, doc.y, { width: CONTENT_W - 4 });
    doc.y += 11;
  }
}

function drawMealDay(doc, dayLabel, meals) {
  const colW = (CONTENT_W - 8) / 4;
  const mealKeys = Object.keys(meals);
  const maxTextH = Math.max(...mealKeys.map(k => textHeight(meals[k], colW - 2, 6.5)));
  const contentH = Math.max(maxTextH, 16) + 7;
  const totalH = 14 + contentH + 4;

  addPageIfNeeded(doc, totalH, 'meal');
  const y = doc.y;

  // Day label bar
  doc.rect(MARGIN, y, CONTENT_W, 13).fillColor(C.teal).fill();
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.white)
    .text(dayLabel, MARGIN + 6, y + 3, { width: CONTENT_W - 12 });

  // 4 meal columns
  for (let i = 0; i < mealKeys.length; i++) {
    const meal = mealKeys[i];
    const x = MARGIN + 4 + (i % 4) * colW;
    const my = y + 16;
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor(C.tealDark)
      .text(`${meal}:`, x, my, { width: colW - 4 });
    doc.fontSize(6.5).font('Helvetica').fillColor(C.dark)
      .text(meals[meal], x, my + 8, { width: colW - 4 });
  }

  // Bottom border
  doc.rect(MARGIN, y, CONTENT_W, 13 + contentH + 6)
    .lineWidth(0.4).strokeColor(C.border).stroke();
  doc.y = y + 13 + contentH + 8;
}

function drawFoodBoxes(doc, include, avoid) {
  const boxW = (CONTENT_W - 10) / 2;
  const boxH = Math.max(include.length * 10 + 20, avoid.length * 10 + 20, 60);

  addPageIfNeeded(doc, boxH + 6, 'foods');
  const y = doc.y;

  // Include box
  doc.roundedRect(MARGIN, y, boxW, boxH, 4)
    .fillColor('#f0fdf4').fill()
    .roundedRect(MARGIN, y, boxW, boxH, 4)
    .lineWidth(0.6).strokeColor('#86efac').stroke();
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.greenDark)
    .text('\u2713  Foods to Include', MARGIN + 6, y + 4, { width: boxW - 12 });
  doc.fontSize(6.5).font('Helvetica').fillColor(C.slate);
  let iy = y + 18;
  for (const item of include) {
    doc.text('\u2022 ' + item, MARGIN + 8, iy, { width: boxW - 14 });
    iy += 9.5;
  }

  // Avoid box
  const ax = MARGIN + boxW + 10;
  doc.roundedRect(ax, y, boxW, boxH, 4)
    .fillColor('#fef2f2').fill()
    .roundedRect(ax, y, boxW, boxH, 4)
    .lineWidth(0.6).strokeColor('#fca5a5').stroke();
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.redDark)
    .text('\u2717  Foods to Avoid', ax + 6, y + 4, { width: boxW - 12 });
  doc.fontSize(6.5).font('Helvetica').fillColor(C.slate);
  let ay = y + 18;
  for (const item of avoid) {
    doc.text('\u2022 ' + item, ax + 8, ay, { width: boxW - 14 });
    ay += 9.5;
  }

  doc.y = y + boxH + 5;
}

function drawWhatsAppCTA(doc) {
  addPageIfNeeded(doc, 38, 'whatsapp');
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 4)
    .fillColor('#dcfce7').fill()
    .roundedRect(MARGIN, y, CONTENT_W, 28, 4)
    .lineWidth(0.6).strokeColor('#22c55e').stroke();
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.greenDark)
    .text('Need a Personalized Diet Plan?  \u2709  WhatsApp Dr. Deepika at ' + CLINIC.whatsapp, MARGIN + 8, y + 8, { width: CONTENT_W - 16 });
  doc.y = y + 34;
}

function drawConsultationBox(doc) {
  addPageIfNeeded(doc, 42, 'consult');
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_W, 34, 4)
    .fillColor('#f0fdfa').fill()
    .roundedRect(MARGIN, y, CONTENT_W, 34, 4)
    .lineWidth(0.6).strokeColor(C.teal).stroke();
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.tealDark)
    .text('Dr. Deepika Singh  |  ' + CLINIC.qualifications, MARGIN + 6, y + 4, { width: CONTENT_W - 12 });
  doc.fontSize(6.5).font('Helvetica').fillColor(C.slate);
  doc.text(CLINIC.address + '  |  ' + CLINIC.phone, MARGIN + 6, y + 16, { width: CONTENT_W - 12 });
  doc.text('Hours: ' + CLINIC.hours + '  |  ' + CLINIC.email, MARGIN + 6, y + 25, { width: CONTENT_W - 12 });
  doc.y = y + 40;
}

function drawDisclaimer(doc) {
  addPageIfNeeded(doc, 26, 'disclaimer');
  const y = doc.y;
  doc.roundedRect(MARGIN, y, CONTENT_W, 20, 3)
    .fillColor('#fffbeb').fill()
    .roundedRect(MARGIN, y, CONTENT_W, 20, 3)
    .lineWidth(0.4).strokeColor('#fbbf24').stroke();
  doc.fontSize(5.5).font('Helvetica-Oblique').fillColor(C.amberText)
    .text('Disclaimer: For informational purposes only. Consult your healthcare provider before starting any new diet.', MARGIN + 5, y + 4, { width: CONTENT_W - 10 });
  doc.y = y + 24;
}

// ============================================
// GENERATE PDF
// ============================================

function generatePDF(planKey, dietKey, outputPath) {
  return new Promise((resolve, reject) => {
    const data = PLANS[planKey];
    const dietData = data[dietKey];
    const dietLabel = dietKey === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';

    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      compress: true,
      info: {
        Title: `${data.title} - ${dietLabel}`,
        Author: CLINIC.doctor,
        Subject: 'Diet Plan',
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    let pageCount = 1;
    doc.on('pageAdded', () => { pageCount++; });

    drawHeader(doc);
    drawTitleBlock(doc, data.title, data.subtitle, dietLabel);
    drawSectionHeading(doc, 'Core Dietary Principles');
    drawPrinciples(doc, data.principles);
    drawSectionHeading(doc, '7-Day Meal Plan');
    for (const dayData of dietData.days) {
      drawMealDay(doc, dayData.day, dayData.meals);
    }
    drawSectionHeading(doc, 'Foods to Include & Avoid');
    drawFoodBoxes(doc, dietData.include, dietData.avoid);
    drawWhatsAppCTA(doc);
    drawConsultationBox(doc);
    drawDisclaimer(doc);
    addFooter(doc);

    doc.end();
    stream.on('finish', () => {
      if (pageCount > 2) console.log(`  WARNING: ${outputPath.split('/').pop()} has ${pageCount} pages`);
      resolve();
    });
    stream.on('error', reject);
  });
}

async function generateAll() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [planKey] of Object.entries(PLANS)) {
    for (const dietKey of Object.keys(FILE_NAMES[planKey])) {
      const fileName = FILE_NAMES[planKey][dietKey];
      const outputPath = path.join(outputDir, fileName);
      console.log(`Generating: ${fileName}...`);
      await generatePDF(planKey, dietKey, outputPath);
      console.log(`  Done (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
    }
  }
  console.log('\nAll 8 PDFs generated successfully!');
}

generateAll().catch(console.error);
