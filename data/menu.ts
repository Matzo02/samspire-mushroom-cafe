// Sample menu for the demo. Replace with the cafe's real menu.
// Items tagged "chef" also appear in the Signatures section.
export type Tag = "veg" | "vegan" | "jain" | "chef" | "new";

export type MenuItem = { name: string; desc: string; price: number; tags: Tag[] };
export type MenuCategory = { id: string; label: string; items: MenuItem[] };

export const TAG_LABELS: Record<Tag, string> = {
  veg: "Veg",
  vegan: "Vegan",
  jain: "Jain",
  chef: "Chef's pick",
  new: "New",
};

export const MENU: MenuCategory[] = [
  {
    id: "starters",
    label: "Small Plates",
    items: [
      { name: "Truffle Mushroom Bruschetta", desc: "Sourdough, sautéed button & oyster mushrooms, truffle oil, parmesan shavings", price: 290, tags: ["veg", "chef"] },
      { name: "Crispy Oyster Mushroom 'Wings'", desc: "Buttermilk-battered oyster mushrooms, smoked chilli glaze, garlic dip", price: 320, tags: ["veg"] },
      { name: "Stuffed Mushroom Caps", desc: "Button caps filled with cream cheese, herbs and breadcrumb, baked golden", price: 280, tags: ["veg"] },
      { name: "Mushroom Galouti Bites", desc: "Melt-in-the-mouth shiitake kebabs on mini ulte tawa parathas", price: 340, tags: ["veg", "new"] },
      { name: "Cream of Wild Mushroom Soup", desc: "Slow-cooked with thyme, finished with a swirl of cream", price: 220, tags: ["veg"] },
    ],
  },
  {
    id: "mains",
    label: "Mains",
    items: [
      { name: "Wild Mushroom Risotto", desc: "Arborio, porcini stock, roasted king oyster, parmesan, brown butter", price: 460, tags: ["veg", "chef"] },
      { name: "Mushroom Stroganoff", desc: "Paprika-cream sauce, mixed mushrooms, buttered rice or pasta", price: 420, tags: ["veg"] },
      { name: "Shiitake Ramen Bowl", desc: "Miso-shiitake broth, noodles, bok choy, soft tofu, chilli oil", price: 440, tags: ["vegan"] },
      { name: "Aglio Olio Funghi", desc: "Spaghetti, garlic, chilli flakes, olive oil, pan-seared oyster mushrooms", price: 380, tags: ["vegan"] },
      { name: "Mushroom Xacuti Bowl", desc: "Goan-style roasted coconut curry with button mushrooms, steamed rice", price: 400, tags: ["vegan", "new"] },
    ],
  },
  {
    id: "pizza-sandwich",
    label: "Pizzas & Sandwiches",
    items: [
      { name: "Funghi Bianca Pizza", desc: "White sauce, three-mushroom mix, mozzarella, rocket, truffle drizzle", price: 480, tags: ["veg", "chef"] },
      { name: "Mushroom & Pesto Pizza", desc: "Basil pesto, roasted mushrooms, sun-dried tomato, bocconcini", price: 450, tags: ["veg"] },
      { name: "Mushroom Melt Sandwich", desc: "Sourdough, caramelised onion, mushrooms, cheddar, mustard mayo", price: 300, tags: ["veg"] },
      { name: "Portobello Burger", desc: "Grilled portobello 'patty', smoked aioli, lettuce, brioche bun, fries", price: 360, tags: ["veg"] },
    ],
  },
  {
    id: "salads",
    label: "Salads",
    items: [
      { name: "Warm Mushroom & Quinoa Salad", desc: "Roasted mushrooms, quinoa, greens, feta, honey-lemon dressing", price: 340, tags: ["veg"] },
      { name: "Asian Shiitake Slaw", desc: "Crunchy cabbage, carrot, pickled shiitake, sesame-ginger dressing", price: 300, tags: ["vegan"] },
    ],
  },
  {
    id: "desserts",
    label: "Desserts",
    items: [
      { name: "Chocolate & Reishi Mousse", desc: "Dark chocolate mousse with an earthy reishi note, sea salt", price: 260, tags: ["veg", "chef"] },
      { name: "Caramel Mushroom Cheesecake", desc: "Baked cheesecake, candied mushroom-caramel crumble", price: 280, tags: ["veg", "new"] },
      { name: "Classic Tiramisu", desc: "Espresso-soaked sponge, mascarpone, cocoa", price: 270, tags: ["veg"] },
    ],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      { name: "Lion's Mane Latte", desc: "Espresso with lion's mane extract, oat or dairy milk", price: 220, tags: ["veg", "chef"] },
      { name: "Chaga Hot Chocolate", desc: "Rich cocoa with chaga mushroom, cinnamon", price: 210, tags: ["veg"] },
      { name: "Cold Brew", desc: "18-hour steeped, served over ice", price: 180, tags: ["vegan"] },
      { name: "Fresh Lime Mint Cooler", desc: "Lime, mint, soda, a pinch of rock salt", price: 150, tags: ["vegan"] },
      { name: "Masala Chai", desc: "Brewed the Pune way", price: 90, tags: ["veg"] },
    ],
  },
];

export const SIGNATURES = MENU.flatMap((c) => c.items).filter((it) => it.tags.includes("chef"));

export const rupee = (n: number) => "₹" + n.toLocaleString("en-IN");
