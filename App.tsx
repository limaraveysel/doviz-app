import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import axios from 'axios';
import {useState} from 'react';
import {useEffect} from 'react';
import { Picker} from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScrollView } from 'react-native';

const API_KEY = '0f45916f7aff8ba3e74d0bc6';

export default function App(){
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("TRY");
  const [rates, setRates] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string>("0");
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [history, setHistory] = useState<Record<string, any>>({});
  const [liveUSD, setLiveUSD] = useState<number>(0);
  const [liveEUR, setLiveEUR] = useState<number>(0);
  const [openDropdown, setOpenDropdown] = useState<"from" | "to" | null>(null);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");


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

  useEffect(() => {
  if (!amount || isNaN(Number(amount))) {
    setResult("0");
    return;
  }

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

//filtreleme
const filteredFrom = currencies.filter(c =>
  c.toLowerCase().includes(searchFrom.toLowerCase())
);
const filteredTo = currencies.filter(c =>
  c.toLowerCase().includes(searchTo.toLowerCase())
);

return (
  
   <TouchableWithoutFeedback
    onPress={() => {
      setOpenDropdown(null);
      Keyboard.dismiss();
    }}
  >
  <ScrollView style={styles.container}>

    <Text style={styles.title}>Döviz Çevirici</Text>

<View style={{ position: "relative" }}>

  {/* FROM */}
  <View style={[styles.box, { marginBottom: 35 }]}>
    
    <Text
      onPress={() => {
        setOpenDropdown("from");
        setSearchFrom("");
      }}
      style={styles.currencyText}
    >
      {from}
    </Text>

    {openDropdown === "from" && (
      <View style={styles.dropdown}>
        <TextInput
          placeholder="Ara..."
          placeholderTextColor="#aaa"
          value={searchFrom}
          onChangeText={setSearchFrom}
          style={styles.searchBox}
        />

        {filteredFrom.slice(0, 8).map((item) => (
          <Text
            key={item}
            style={styles.item}
            onPress={() => {
              setFrom(item);
              setOpenDropdown(null);
            }}
          >
            {item}
          </Text>
        ))}
      </View>
    )}

    <TextInput
      style={styles.amountInput}
      keyboardType="numeric"
      value={amount}
      onChangeText={setAmount}
    />
  </View>

  {/* SWAP (FLOATING) */}
  <View style={styles.swapCircle}>
    <MaterialIcons
      name="swap-vert"
      size={26}
      color="#5f6368"
      style={styles.swapIcon}
      onPress={() => {
        const temp = from;
        setFrom(to);
        setTo(temp);
      }}
    />
  </View>

  {/* TO */}
  <View style={[styles.box, { marginTop: 35 }]}>
    
    <Text
      onPress={() => {
        setOpenDropdown("to");
        setSearchTo("");
      }}
      style={styles.currencyText}
    >
      {to}
    </Text>

    {openDropdown === "to" && (
      <View style={styles.dropdown}>
        <TextInput
          placeholder="Ara..."
          placeholderTextColor="#aaa"
          value={searchTo}
          onChangeText={setSearchTo}
          style={styles.searchBox}
        />

        {filteredTo.slice(0, 8).map((item) => (
          <Text
            key={item}
            style={styles.item}
            onPress={() => {
              setTo(item);
              setOpenDropdown(null);
            }}
          >
            {item}
          </Text>
        ))}
      </View>
    )}

    <Text style={styles.resultText}>
      {result}
    </Text>
  </View>

</View>


{/*GUNCEL KUR*/ }
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

{/*GECMIS GUNLERIN KUR DEGISIMI*/ }
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
          <Text style={{ color: usdUp ? "#00ff9d" : "#ff4d4d", fontSize:16 }}>
            {usdToTry.toFixed(2)}
          </Text>

          <Text style={{ color: usdUp ? "#00ff9d" : "#ff4d4d", marginLeft: 5, fontSize:16}}>
            {usdUp ? "↑" : "↓"}
          </Text>
        </View>

        <View style={styles.cellRow}>
          <Text style={{ color: eurUp ? "#00ff9d" : "#ff4d4d", fontSize:16}}>
            {eurToTry.toFixed(2)}
          </Text>

          <Text style={{ color: eurUp ? "#00ff9d" : "#ff4d4d", marginLeft: 5, fontSize:16 }}>
            {eurUp ? "↑" : "↓"}
          </Text>
        </View>

      </View>
    );
  })}
</View>

  </ScrollView>
</TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#88c4e2",
  },

  title: {
    fontSize: 26,
    color: "#1d1d1d",
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
  backgroundColor: "#287d40",
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
  fontSize: 16,
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

dropdown: {
  position: "absolute",
  top: 50,
  left: 0,
  right: 0,
  backgroundColor: "#222",
  borderRadius: 10,
  maxHeight: 200,
  zIndex: 1000,
  elevation: 5,
},

cellRow:{
  flexDirection:"row",
  alignItems:"center",
},

box: {
  backgroundColor: "#1c1c1c",
  padding: 15,
  borderRadius: 15,
  marginBottom: 25, 
  position: "relative",
},

swapCircle: {
  position: "absolute",
  top: "42%",
  left: 0,
  right: 0,
  alignItems: "center",
  zIndex: 10,
},

swapIcon: {
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 30,
  elevation: 6,
},

currencyText:{
  color:"#97d2d2",
  fontSize:25,
  fontWeight:"bold",
},

amountInput:{
  backgroundColor: "#e8f0fe",
  color: "#1967d2",
  fontSize: 18,
  fontWeight: "600",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 20,
  minWidth: 90,
},

resultText:{
  backgroundColor:"#e8f0fe",
  color:"#1967d2",
  fontSize:18,
  fontWeight: "600",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 20,
  minWidth: 90,
},

searchBox:{
  backgroundColor:"#e8f0fe",
  color:"#000",
  paddingHorizontal:15,
  paddingVertical:8,
  borderRadius:10,
  margin:10,
},
item:{
  paddingHorizontal:15,
  paddingVertical:8,
  color:"#fff",
}
  });