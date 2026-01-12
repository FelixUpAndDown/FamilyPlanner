import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');
  const rawData = globalThis.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.codePointAt(i) || 0;
  }
  return outputArray;
}

export function usePushNotifications(userId?: string, familyId?: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in globalThis;
    setIsSupported(supported);
    if (supported && 'Notification' in globalThis) {
      setPermission(Notification.permission);
      checkSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const subscribe = async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      setError('VAPID Public Key missing');
      return;
    }
    if (!userId || !familyId) {
      setError('User ID or Family ID missing');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        setError('Notifications denied');
        setLoading(false);
        return;
      }
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const { endpoint, keys } = subscription as any;
      const subscriptionData = {
        user_id: userId,
        family_id: familyId,
        endpoint,
        p256dh: keys?.p256dh || '',
        auth: keys?.auth || '',
      };
      const { error: dbError } = await supabase
        .from('push_subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'endpoint',
        });
      if (dbError) throw dbError;
      setIsSubscribed(true);
    } catch (err: any) {
      setError(typeof err === 'object' ? JSON.stringify(err) : String(err));
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);
        if (dbError) throw dbError;
      }
      setIsSubscribed(false);
    } catch (err: any) {
      setError(err.message || 'Error disabling notifications');
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
    loading,
    error,
  };
}
