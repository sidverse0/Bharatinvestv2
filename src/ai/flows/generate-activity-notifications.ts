'use server';

/**
 * @fileOverview Simulates real-time activity notifications to build trust and engagement.
 *
 * - generateActivityNotifications - Generates a random activity notification message.
 * - ActivityNotificationsOutput - The output type for the generateActivityNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActivityNotificationsOutputSchema = z.object({
  message: z.string().describe('A simulated real-time activity notification message.'),
});
export type ActivityNotificationsOutput = z.infer<typeof ActivityNotificationsOutputSchema>;

export async function generateActivityNotifications(): Promise<ActivityNotificationsOutput> {
  return generateActivityNotificationsFlow();
}

const generateActivityNotificationsFlow = ai.defineFlow(
  {
    name: 'generateActivityNotificationsFlow',
    outputSchema: ActivityNotificationsOutputSchema,
  },
  async () => {
    const names = ['Ramesh', 'Kavita', 'Ankit', 'Priya', 'Suresh'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const amounts = [100, 200, 400, 600, 1000];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
    const actions = ['invested', 'withdrew', 'deposited'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    let message = '';
    switch (randomAction) {
      case 'invested':
        message = `👤 ${randomName} just invested ₹${randomAmount}`;
        break;
      case 'withdrew':
        message = `💸 ${randomName} withdrew ₹${randomAmount} successfully`;
        break;
      case 'deposited':
        message = `📈 ${randomName} deposited ₹${randomAmount}`;
        break;
    }

    return {
      message: message,
    };
  }
);
