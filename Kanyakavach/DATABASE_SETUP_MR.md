# Kanyakavach database सुरू करण्यासाठी

ही app MySQL शी थेट जोडत नाही. फोनमधील app → backend API → MySQL अशी जोडणी आहे.

## तुमच्या Wi-Fi वर सुरू करा

1. MySQL Workbench उघडा. `backend/schema.sql` उघडून पूर्ण script चालवा. यामुळे `kanyakavach` database आणि आवश्यक tables तयार होतील.
2. PowerShell मध्ये `backend` folder उघडा. `.env.example` ची `.env` अशी copy करा आणि `.env` मध्ये MySQL password भरा. `JWT_SECRET` मध्ये किमान 32 अक्षरांचा वेगळा secret ठेवा. ही `.env` file कोणालाही पाठवू नका.
3. `backend` folder मध्ये `npm start` चालवा. `http://localhost:3000/health` उघडल्यावर database connected दिसायला हवं.
4. संगणकाचा Wi-Fi IPv4 पत्ता शोधण्यासाठी `ipconfig` चालवा. Expo app च्या मुख्य `kanyakavach` folder मध्ये `.env` file तयार करून ही ओळ टाका:

   ```env
   EXPO_PUBLIC_API_URL=http://तुमचा-WiFi-IPv4-पत्ता:3000
   ```

   उदाहरणार्थ, पत्ता `192.168.1.20` असल्यास `EXPO_PUBLIC_API_URL=http://192.168.1.20:3000`.

5. Expo app च्या मुख्य folder मध्ये `npx expo start -c` चालवा. फोन व संगणक एकाच Wi-Fi वर असू द्या. Windows Firewall ने विचारल्यास Node.js ला Private network access द्या.

इतर लोकांनी वेगवेगळ्या नेटवर्कवरून वापरण्यासाठी backend आणि MySQL online host करावे लागतील आणि API साठी HTTPS वापरावे लागेल. सध्याची मांडणी तुमच्या संगणकावर development आणि एकाच Wi-Fi वरील चाचणीसाठी आहे.

Database मध्ये वापरकर्ता खाते, emergency contacts, SOS event चे location/time/status आणि Safety Trip चे सुरुवातीचे ठिकाण/गंतव्य/वेळ/स्थिती साठवली जाते. Password API मध्ये hash स्वरूपात साठतो.
