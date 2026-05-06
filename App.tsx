import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import axios from 'axios';
import {useState} from 'react';
import {useEffect} from 'react';
import { Picker} from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';

const API_KEY = '0f45916f7aff8ba3e74d0bc6';

export default function App(){
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("TRY");
  const [to, setTo] = useState("USD");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string>("0");
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, any>>({});
  const [liveUSD, setLiveUSD] = useState<number>(0);
  const [liveEUR, setLiveEUR] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState<"from" | "to" | null>(null);


  //doviz kurlarini apiden cekme
 const getRates = async () => {
    try {
      const res = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/TRY`
      );

      const data = res.data.conversion_rates;

      setRates(data);
      setCurrencies(Object.keys(data)); //tum para birimleri al kaydet

      setLiveUSD(1 / data["USD"]);
      setLiveEUR(1 / data["EUR"]);

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
      `https://api.frankfurter.app/${format(lastWeek)}..${format(today)}?from=USD&to=TRY,EUR` );

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
  
   <TouchableWithoutFeedback
    onPress={() => {
      setOpenDropdown(null);
      Keyboard.dismiss();
    }}
  >
  <View style={styles.container}>

    <Text style={styles.title}>Doviz Çevirici</Text>


    <View style={styles.box}>
    <Text onPress={() => setOpenDropdown("from")} style={styles.dropdownLabel}>
    {from}
  </Text>

  {openDropdown === "from" && (
    <Picker selectedValue={from} onValueChange={(val) => {
      setFrom(val);
      setOpenDropdown(null); // seçince kapat
    }}>
      {currencies.map(c => (
        <Picker.Item key={c} label={c} value={c} />
      ))}
    </Picker>
  )}

      <TextInput
        style={styles.bigInput}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="Miktar gir"
        placeholderTextColor="#aaa"
      />
    </View>

    <View style={styles.swapCircle}>
      <MaterialIcons
        name="swap-vert"
        size={30}
        color="#fff"
        onPress={() => {
          const temp = from;
          setFrom(to);
          setTo(temp);
        }}
      />
    </View>

    <View style={styles.box}>
        <Picker
    selectedValue={to}
    onValueChange={setTo}
    style={styles.pickerTop}
  >
    {currencies.map((curr) => (
      <Picker.Item key={curr} label={curr} value={curr} />
    ))}
  </Picker>

      <Text style={styles.bigResult}>
        {result} 
      </Text>
    </View>

    <View style={styles.topRow}>
      <View style={styles.rateCard}>
        <Text style={styles.rateTitle}>USD</Text>
        <Text style={styles.rateValue}>{liveUSD.toFixed(2)} ₺</Text>
      </View>

      <View style={styles.rateCard}>
        <Text style={styles.rateTitle}>EUR</Text>
        <Text style={styles.rateValue}>{liveEUR.toFixed(2)} ₺</Text>
      </View>
    </View>


   <View style={styles.tableContainer}>

  <View style={styles.tableHeader}>
    <Text style={styles.tableHeaderText}>Tarih</Text>
    <Text style={styles.tableHeaderText}>USD (₺)</Text>
    <Text style={styles.tableHeaderText}>EUR (₺)</Text>
  </View>

  {Object.entries(history)
  .reverse()
  .map(([date, value]: any, i, arr) => {

    const usdToTry = value["TRY"];
    const usdToEur = value["EUR"];
    const eurToTry = usdToTry / usdToEur;

    const prevUsd =
      i < arr.length - 1 ? arr[i + 1][1]["TRY"] : usdToTry;

    const prevEur =
      i < arr.length - 1
        ? arr[i + 1][1]["TRY"] / arr[i + 1][1]["EUR"]
        : eurToTry;

    const usdUp = usdToTry > prevUsd;
    const eurUp = eurToTry > prevEur;

    return (
      <View key={date} style={styles.tableRow}>

        <Text style={styles.tableDate}>
          {new Date(date).toLocaleDateString("tr-TR")}
        </Text>

        <View style={styles.cellRow}>
          <Text style={{ color: usdUp ? "#00ff9d" : "#ff4d4d" }}>
            {usdToTry.toFixed(2)}
          </Text>

          <Text style={{ color: usdUp ? "#00ff9d" : "#ff4d4d", marginLeft: 5 }}>
            {usdUp ? "↑" : "↓"}
          </Text>
        </View>

        <View style={styles.cellRow}>
          <Text style={{ color: eurUp ? "#00ff9d" : "#ff4d4d", fontSize:10}}>
            {eurToTry.toFixed(2)}
          </Text>

          <Text style={{ color: eurUp ? "#00ff9d" : "#ff4d4d", marginLeft: 5, fontSize:10 }}>
            {eurUp ? "↑" : "↓"}
          </Text>
        </View>

      </View>
    );
  })}
</View>

  </View>
</TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#9384b4",
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
    alignItems:"center",
    marginTop:10,
  },

  picker: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
  },

  result: {
    marginTop: 20,
    fontSize: 24,
    color: "#cbebe2",
    textAlign: "center",
  },

  tableContainer: {
  marginTop: 25,
  backgroundColor: "#0f3d1c",
  borderRadius: 12,
  padding: 10,
},

tableHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  borderBottomWidth: 1,
  borderBottomColor: "#1f4d2c",
  paddingBottom: 8,
  marginBottom: 8,
},

tableHeaderText: {
  color: "#d3c1c1",
  fontWeight: "bold",
  fontSize: 14,
},

tableRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "#1f4d2c",
},

tableDate: {
  color: "#ccc",
  fontSize: 13,
},

tableCell: {
  color: "#fff",
  fontWeight: "bold",
},

  topRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  rateCard: {
    backgroundColor: "#1c1c1c",
    padding: 10,
    borderRadius: 8,
  },

  rateTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding:5,
    margin:5,
  },

  rateValue: {
    color: "#97d2d2",
    fontSize: 16,
    padding:5,
    margin:5,
  },

  box: {
  backgroundColor: "#1c1c1c",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
},

label: {
  color: "#aaa",
  marginBottom: 5,
},

bigInput: {
  fontSize: 28,
  color: "#fff",
  marginTop: 10,
},

bigResult: {
  fontSize: 32,
  color: "#fff",
  marginTop: 10,
  fontWeight: "bold",
},

swapCircle: {
  alignSelf: "center",
  backgroundColor: "#18c4eb",
  borderRadius: 50,
  padding: 12,
  marginVertical: 10,
},

pickerTop:{
  backgroundColor:"#333",
  marginBottom:5,
  color:"#fff",
},

dropdownLabel:{
  color:"#fff",
  fontSize:20,
  fontWeight:"bold",
  backgroundColor:"#333",
  padding:10,
  borderRadius:8,
},

cellRow:{
  flexDirection:"row",
  alignItems:"center",
}
  });
