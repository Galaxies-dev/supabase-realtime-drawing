import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import DrawingBoard, { DrawingBoardRef } from '~/components/DrawingBoard';

import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const client = createClient(supabaseUrl!, supabaseAnonKey!);

const randomUsername = `user-${Math.floor(Math.random() * 1000)}`;
const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

export default function Page() {
  const { channel } = useLocalSearchParams();
  const [broadcastChannel, setBroadcastChannel] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const drawingRef = useRef<DrawingBoardRef>(null);

  useEffect(() => {
    if (!channel || isConnected) return;

    const newChannel = client.channel(`drawing-${channel}`);
    setBroadcastChannel(newChannel);

    const subscription = newChannel
      .on('broadcast', { event: 'start' }, ({ payload }) => {
        const { user, x, y, color } = payload;
        drawingRef.current?.receivedStart(x, y, user, color);
      })
      .on('broadcast', { event: 'active' }, ({ payload }) => {
        const { user, x1, y1, x2, y2 } = payload;
        drawingRef.current?.receivedActive(x1, y1, x2, y2, user);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });
    return () => {
      subscription.unsubscribe();
    };
  }, [channel]);

  const onDrawingStart = (x: number, y: number) => {
    broadcastChannel.send({
      type: 'broadcast',
      event: 'start',
      payload: { x, y, user: randomUsername, color: randomColor },
    });
  };

  const onDrawingActive = (x1: number, y1: number, x2: number, y2: number) => {
    broadcastChannel.send({
      type: 'broadcast',
      event: 'active',
      payload: { x1, y1, x2, y2, user: randomUsername },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ title: `Channel: ${channel} - #${randomUsername}` }} />
      {isConnected && (
        <DrawingBoard ref={drawingRef} onStart={onDrawingStart} onActive={onDrawingActive} />
      )}
    </View>
  );
}
