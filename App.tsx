import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import axios from 'axios';
import {useState} from 'react';
import {useEffect} from 'react';
import { Picker} from '@react-native-picker/picker';

const API_KEY = '0f45916f7aff8ba3e74d0bc6';

export default function App(){
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("TRY");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [result, setResult] = useState<string>("0");
 const getRates = async () => {
    try {
      const res = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
      );
      setRates(res.data.conversion_rates);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getRates();
  }, []);

  useEffect(() => {
    if (rates[from] && rates[to]) {
      const converted =
        (parseFloat(amount) / rates[from]) * rates[to];
      setResult(converted.toFixed(2));
    }
  }, [amount, from, to, rates]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Döviz Çevirici</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.row}>
        <Picker selectedValue={from} onValueChange={setFrom} style={styles.picker}>
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="TRY" value="TRY" />
          <Picker.Item label="EUR" value="EUR" />
        </Picker>

        <Picker selectedValue={to} onValueChange={setTo} style={styles.picker}>
          <Picker.Item label="TRY" value="TRY" />
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="EUR" value="EUR" />
        </Picker>
      </View>

      <Text style={styles.result}>
        Sonuç: {result} {to}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#141E30",
  },
  title: {
    fontSize: 26,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
  },
  picker: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
  },
  result: {
    marginTop: 20,
    fontSize: 24,
    color: "#00c6ff",
    textAlign: "center",
  },
});
