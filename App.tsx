import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import axios from 'axios';
import {useState} from 'react';
import {useEffect} from 'react';
import { Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';

const API_KEY = '0f45916f7aff8ba3e74d0bc6';

export default function App(){
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("TRY");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string>("0");
  const [currencies, setCurrencies] =useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, any>>({});

  //doviz kurlarini apiden cekme
 const getRates = async () => {
    try {
      const res = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`
      );

      const data = res.data.conversion_rates;

      setRates(data);
      setCurrencies(Object.keys(data)); //tum para birimleri al kaydet

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

  //son yedı gunun kuru
const getHistory = async () => {
  try {
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const format = (d: Date) => d.toISOString().split("T")[0];

    const res = await axios.get(
      `https://api.frankfurter.app/${format(lastWeek)}..${format(today)}?from=${from}&to=${to}`
    );

    const rates = res.data?.rates;

    if (!rates || typeof rates !== "object") {
      setHistory({});
      return;
    }

    setHistory(rates);
  } catch (err) {
    console.log("history error:", err);
    setHistory({});
  }
};

useEffect(() => {
  getHistory();
}, [from, to]);


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
              {currencies.map((curr) => (
            <Picker.Item key={curr} label={curr} value={curr} />
          ))}
        </Picker>
        <View style={{ alignItems: "center", marginVertical: 10 }}>
           <Icon
                  name="exchange"
                  size={40}
                  color="#fff"
                  onPress={() => {
                  const temp = from;
                  setFrom(to);
                  setTo(temp);
                }}
             />
         </View>
        <Picker selectedValue={to} onValueChange={setTo} style={styles.picker}>
          {currencies.map((curr) => (
            <Picker.Item key={curr} label={curr} value={curr} />
          ))}
        </Picker>
      </View>

      <Text style={styles.result}>
        Sonuç: {result} {to}
      </Text>

<View style={{ marginTop: 20 }}>
  {history &&
    Object.keys(history).length > 0 &&
    Object.entries(history).map(([date, value]: any) => (
      <View
        key={date}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          backgroundColor: "#1c1c1c",
          marginBottom: 5,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff" }}>
          {date}
        </Text>

        <Text style={{ color: "#00f2fe" }}>
          {value?.[to] ?? "N/A"}
        </Text>
      </View>
    ))}
</View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#024c17",
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
