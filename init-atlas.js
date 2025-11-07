// MongoDB Atlas initialization script
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://ecotrack-user:Bb4xyleimssZN3HT@ecotrack.46jaeyv.mongodb.net/ecotrack?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('ecotrack');

    console.log("Connected to MongoDB Atlas");

    // Create collections
    await db.createCollection('users');
    await db.createCollection('activities');
    await db.createCollection('emission_factors');
    await db.createCollection('achievements');
    await db.createCollection('recommendations');
    await db.createCollection('user_achievements');
    await db.createCollection('user_recommendations');

    console.log("Collections created");

    // Create indexes
    const usersCollection = db.collection('users');
    const activitiesCollection = db.collection('activities');
    const emissionFactorsCollection = db.collection('emission_factors');
    const userAchievementsCollection = db.collection('user_achievements');
    const userRecommendationsCollection = db.collection('user_recommendations');

    await usersCollection.createIndex({ "email": 1 }, { unique: true });
    await activitiesCollection.createIndex({ "user_id": 1, "date": -1 });
    await emissionFactorsCollection.createIndex({ "category": 1, "type": 1, "region": 1 });
    await userAchievementsCollection.createIndex({ "user_id": 1, "achievement_name": 1 }, { unique: true });
    await userRecommendationsCollection.createIndex({ "user_id": 1, "recommendation_id": 1 });

    console.log("Indexes created");

    // Insert default emission factors
    await emissionFactorsCollection.insertMany([
      // Transport
      { category: "transport", type: "car", factor: 0.21, unit: "kg CO2/km", source: "EPA", region: "global", last_updated: new Date() },
      { category: "transport", type: "bus", factor: 0.089, unit: "kg CO2/km", source: "EPA", region: "global", last_updated: new Date() },
      { category: "transport", type: "bicycle", factor: 0, unit: "kg CO2/km", source: "EPA", region: "global", last_updated: new Date() },
      { category: "transport", type: "walk", factor: 0, unit: "kg CO2/km", source: "EPA", region: "global", last_updated: new Date() },
      { category: "transport", type: "train", factor: 0.041, unit: "kg CO2/km", source: "EPA", region: "global", last_updated: new Date() },
      { category: "transport", type: "plane", factor: 0.255, unit: "kg CO2/km", source: "EPA", region: "global", last_updated: new Date() },

      // Energy
      { category: "energy", type: "electricity", factor: 0.5, unit: "kg CO2/kWh", source: "IEA", region: "global", last_updated: new Date() },
      { category: "energy", type: "gas", factor: 2.3, unit: "kg CO2/m3", source: "IEA", region: "global", last_updated: new Date() },
      { category: "energy", type: "water", factor: 0.001, unit: "kg CO2/liter", source: "EPA", region: "global", last_updated: new Date() },
      { category: "energy", type: "heating_oil", factor: 2.7, unit: "kg CO2/liter", source: "EPA", region: "global", last_updated: new Date() },

      // Food
      { category: "food", type: "meat", factor: 7.2, unit: "kg CO2/meal", source: "FAO", region: "global", last_updated: new Date() },
      { category: "food", type: "vegetarian", factor: 2.5, unit: "kg CO2/meal", source: "FAO", region: "global", last_updated: new Date() },
      { category: "food", type: "vegan", factor: 1.5, unit: "kg CO2/meal", source: "FAO", region: "global", last_updated: new Date() },
      { category: "food", type: "local", factor: 1.0, unit: "kg CO2/meal", source: "FAO", region: "global", last_updated: new Date() },
      { category: "food", type: "dairy", factor: 3.2, unit: "kg CO2/serving", source: "FAO", region: "global", last_updated: new Date() },
      { category: "food", type: "eggs", factor: 4.8, unit: "kg CO2/serving", source: "FAO", region: "global", last_updated: new Date() },

      // Waste
      { category: "waste", type: "recycling", factor: -0.5, unit: "kg CO2/kg", source: "EPA", region: "global", last_updated: new Date() },
      { category: "waste", type: "compost", factor: -0.3, unit: "kg CO2/kg", source: "EPA", region: "global", last_updated: new Date() },
      { category: "waste", type: "general", factor: 1.5, unit: "kg CO2/kg", source: "EPA", region: "global", last_updated: new Date() },
      { category: "waste", type: "plastic", factor: 2.0, unit: "kg CO2/kg", source: "EPA", region: "global", last_updated: new Date() },
      { category: "waste", type: "paper", factor: 0.8, unit: "kg CO2/kg", source: "EPA", region: "global", last_updated: new Date() }
    ]);

    console.log("Emission factors inserted");

    // Insert default achievements
    const achievementsCollection = db.collection('achievements');
    await achievementsCollection.insertMany([
      {
        name: "Primeros Pasos",
        description: "Registra tu primera actividad",
        icon: "🌱",
        criteria: { "activities_count": 1 },
        points: 10,
        category: "general",
        created_at: new Date()
      },
      {
        name: "Eco Guerrero",
        description: "Registra 50 actividades",
        icon: "⚔️",
        criteria: { "activities_count": 50 },
        points: 50,
        category: "general",
        created_at: new Date()
      },
      {
        name: "Héroe del Carbono",
        description: "Registra 100 actividades",
        icon: "🏆",
        criteria: { "activities_count": 100 },
        points: 100,
        category: "general",
        created_at: new Date()
      },
      {
        name: "Transporte Sostenible",
        description: "Registra 20 actividades de transporte",
        icon: "🚲",
        criteria: { "transport_activities": 20 },
        points: 30,
        category: "transport",
        created_at: new Date()
      },
      {
        name: "Eficiencia Energética",
        description: "Registra 15 actividades de energía",
        icon: "💡",
        criteria: { "energy_activities": 15 },
        points: 25,
        category: "energy",
        created_at: new Date()
      }
    ]);

    console.log("Achievements inserted");
    console.log("Database initialized successfully!");

  } finally {
    await client.close();
  }
}

run().catch(console.error);