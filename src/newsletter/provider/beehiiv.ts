import type {
  CheckSubscribeStatusParams,
  NewsletterProvider,
  SubscribeNewsletterParams,
  UnsubscribeNewsletterParams,
} from '@/newsletter/types';
import { BeehiivClient, BeehiivError } from '@beehiiv/sdk';

/**
 * Implementation of the NewsletterProvider interface using Beehiiv
 * 
 * Beehiiv is a newsletter platform that provides:
 * - Subscription management via API
 * - Publication-based subscriber organization
 * - Rich subscriber data & analytics
 * 
 * Docs:
 * https://developers.beehiiv.com/
 * https://github.com/beehiiv/typescript-sdk
 */
export class BeehiivNewsletterProvider implements NewsletterProvider {
  private client: BeehiivClient;
  private publicationId: string;

  constructor() {
    if (!process.env.BEEHIIV_API_KEY) {
      throw new Error('BEEHIIV_API_KEY environment variable is not set.');
    }

    if (!process.env.BEEHIIV_PUBLICATION_ID) {
      throw new Error('BEEHIIV_PUBLICATION_ID environment variable is not set.');
    }

    this.client = new BeehiivClient({ token: process.env.BEEHIIV_API_KEY });
    this.publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  }

  /**
   * Get the provider name
   * @returns Provider name
   */
  public getProviderName(): string {
    return 'Beehiiv';
  }

  /**
   * Subscribe a user to the newsletter
   * @param email The email address to subscribe
   * @returns True if the subscription was successful, false otherwise
   */
  async subscribe({ email }: SubscribeNewsletterParams): Promise<boolean> {
    try {
      await this.client.subscriptions.create(this.publicationId, {
        email,
        reactivate_existing: false,
        send_welcome_email: false,
        utm_source: 'website',
        utm_medium: 'subscribe_form',
      });

      console.log('Subscribed to newsletter:', email);
      return true;
    } catch (error) {
      console.error('Error subscribing newsletter', error);
      return false;
    }
  }

  /**
   * Unsubscribe a user from the newsletter
   * @param email The email address to unsubscribe
   * @returns True if the unsubscription was successful, false otherwise
   */
  async unsubscribe({ email }: UnsubscribeNewsletterParams): Promise<boolean> {
    try {
      await this.client.subscriptions.updateByEmail(this.publicationId, email, {
        unsubscribe: true,
      });

      console.log('Unsubscribed from newsletter:', email);
      return true;
    } catch (error) {
      console.error('Error unsubscribing newsletter', error);
      return false;
    }
  }

  /**
   * Check if a user is subscribed to the newsletter
   * @param email The email address to check
   * @returns True if the user is subscribed, false otherwise
   */
  async checkSubscribeStatus({
    email,
  }: CheckSubscribeStatusParams): Promise<boolean> {
    try {
      const response = await this.client.subscriptions.getByEmail(
        this.publicationId,
        email
      );

      const subscription = response.data;
      const isActive = subscription?.status === 'active';

      console.log('Check subscribe status:', { email, isActive });
      return Boolean(isActive);
    } catch (error) {
      if (error instanceof BeehiivError && error.statusCode === 404) {
        console.warn('No subscription found for email:', email);
        return false;
      }

      console.error('Error checking subscribe status:', error);
      return false;
    }
  }
}
