import { PrismaClient, RestaurantStatus, DietaryPreference } from '../src/generated/prisma';
const prisma = new PrismaClient();
async function main() {
    console.log('Seeding South BLR Restaurants...');
    // 1. Ensure we have an owner user
    let owner = await prisma.user.findFirst({
        where: { roles: { has: 'RESTAURANT_OWNER' } },
    });
    if (!owner) {
        owner = await prisma.user.create({
            data: {
                email: `owner_${Date.now()}@test.com`,
                passwordHash: 'dummy_hash',
                roles: ['RESTAURANT_OWNER'],
            },
        });
        console.log('Created dummy owner user.');
    }
    else {
        console.log('Found existing owner user:', owner.email);
    }
    // Define some South BLR Restaurants
    const restaurantsToCreate = [
        {
            name: 'South BLR Spice Route',
            description: 'Authentic South Indian thalis and snacks.',
            logoUrl: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?auto=format&fit=crop&w=200&q=80',
            coverImageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?auto=format&fit=crop&w=1200&q=80',
            categories: [
                {
                    name: 'Breakfast',
                    items: [
                        { name: 'Masala Dosa', price: 80, desc: 'Crispy dosa with potato filling' },
                        { name: 'Idli Vada', price: 60, desc: 'Steamed rice cakes with lentil donut' }
                    ]
                },
                {
                    name: 'Meals',
                    items: [
                        { name: 'South Indian Thali', price: 150, desc: 'Full unlimited meal' }
                    ]
                }
            ]
        },
        {
            name: 'South BLR Biryani House',
            description: 'The best Donne Biryani in town.',
            logoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
            coverImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
            categories: [
                {
                    name: 'Biryani',
                    items: [
                        { name: 'Chicken Donne Biryani', price: 180, desc: 'Classic Nati style biryani', pref: DietaryPreference.NON_VEG },
                        { name: 'Mutton Donne Biryani', price: 250, desc: 'Tender mutton pieces in fragrant rice', pref: DietaryPreference.NON_VEG }
                    ]
                }
            ]
        },
        {
            name: 'South BLR Cafe',
            description: 'Filter coffee and quick bites.',
            logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
            coverImageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
            categories: [
                {
                    name: 'Beverages',
                    items: [
                        { name: 'Filter Coffee', price: 30, desc: 'Strong traditional filter coffee' },
                        { name: 'Tea', price: 25, desc: 'Masala tea' }
                    ]
                },
                {
                    name: 'Snacks',
                    items: [
                        { name: 'Mangalore Bajji', price: 40, desc: 'Crispy deep fried snack' }
                    ]
                }
            ]
        }
    ];
    for (const rData of restaurantsToCreate) {
        const restaurant = await prisma.restaurant.create({
            data: {
                ownerId: owner.id,
                name: rData.name,
                description: rData.description,
                logoUrl: rData.logoUrl,
                coverImageUrl: rData.coverImageUrl,
                phoneNumber: '+91 9999999999',
                email: `contact@${rData.name.toLowerCase().replace(/ /g, '')}.com`,
                streetAddress: 'South BLR, Jayanagar',
                city: 'Bangalore',
                state: 'Karnataka',
                zipCode: '560011',
                country: 'India',
                latitude: 12.9299,
                longitude: 77.5834,
                h3Cell: '8860145b0dfffff', // Approx H3 for South BLR (Jayanagar area)
                status: RestaurantStatus.ACTIVE,
            }
        });
        console.log(`Created Restaurant: ${restaurant.name} (${restaurant.id})`);
        // Create Categories and Items
        for (let i = 0; i < rData.categories.length; i++) {
            const cData = rData.categories[i];
            const category = await prisma.menuCategory.create({
                data: {
                    restaurantId: restaurant.id,
                    name: cData.name,
                    sortOrder: i
                }
            });
            for (let j = 0; j < cData.items.length; j++) {
                const item = cData.items[j];
                await prisma.menuItem.create({
                    data: {
                        restaurantId: restaurant.id,
                        categoryId: category.id,
                        name: item.name,
                        description: item.desc,
                        price: item.price,
                        sortOrder: j,
                        dietaryPreference: item.pref || DietaryPreference.VEG
                    }
                });
            }
        }
    }
    console.log('Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
