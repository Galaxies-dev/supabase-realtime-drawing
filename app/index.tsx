import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';

export default function Page() {
  const router = useRouter();
  const [channel, setChannel] = useState('1');

  const onJoin = () => {
    router.navigate(`/channel/${channel}`);
  };
  return (
    <View>
      <TextInput
        value={channel}
        onChangeText={setChannel}
        style={styles.input}
        inputMode="numeric"
      />
      <TouchableOpacity onPress={onJoin} style={styles.button}>
        <Text style={styles.text}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderColor: '#808080',
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 8,
  },
  button: {
    backgroundColor: '#2E8A58',
    borderRadius: 8,
    padding: 12,
    margin: 8,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
