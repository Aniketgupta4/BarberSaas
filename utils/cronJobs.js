const cron = require('node-cron');
const User = require('../models/User');

const startCronJobs = () => {
    // '0 0 * * *' ka matlab hai: Har raat theek 12:00 AM (Midnight) par run hoga
    cron.schedule('0 0 * * *', async () => {
        console.log('⏰ Running daily subscription check...');
        try {
            const today = new Date();
            
            // Un sabhi BarberOwners ko dhoondo jinki date nikal chuki hai aur wo abhi bhi active hain
            const result = await User.updateMany(
                { 
                    role: 'BarberOwner', 
                    isActive: true, 
                    subscriptionEnd: { $lt: today } // Agar aaj ki date se chota hai (past me hai)
                },
                { 
                    $set: { isActive: false } // Unko Inactive kar do
                }
            );

            console.log(`✅ Subscription check complete. Deactivated ${result.modifiedCount} expired accounts.`);
        } catch (error) {
            console.error('❌ Error running cron job:', error);
        }
    });

    console.log('⏳ Background Cron Jobs Scheduled');
};

module.exports = startCronJobs;