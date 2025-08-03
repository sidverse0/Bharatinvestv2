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
  name: z.string().describe('The name of the user in the notification.'),
  action: z.string().describe('The action performed (e.g., "invested", "withdrew", "deposited").'),
  amount: z.number().describe('The amount of money involved.'),
  actionIcon: z.string().describe('An emoji representing the action.'),
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
    const actions = [
        { action: 'invested', icon: '👤' },
        { action: 'withdrew', icon: '💸' },
        { action: 'deposited', icon: '📈' },
    ];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    return {
      name: randomName,
      action: randomAction.action,
      amount: randomAmount,
      actionIcon: randomAction.icon,
    };
  }
);
