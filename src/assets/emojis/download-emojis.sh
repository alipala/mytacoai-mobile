#!/bin/bash

# Download OpenMoji SVG files for A1/A2 language learning
# Base URL for OpenMoji color SVGs
BASE_URL="https://openmoji.org/data/color/svg"

# Food & Drink (10)
curl -o coffee.svg "$BASE_URL/2615.svg"
curl -o bread.svg "$BASE_URL/1F35E.svg"
curl -o rice.svg "$BASE_URL/1F35A.svg"
curl -o apple.svg "$BASE_URL/1F34E.svg"
curl -o milk.svg "$BASE_URL/1F95B.svg"
curl -o water.svg "$BASE_URL/1F4A7.svg"
curl -o pizza.svg "$BASE_URL/1F355.svg"
curl -o hamburger.svg "$BASE_URL/1F354.svg"
curl -o pasta.svg "$BASE_URL/1F35D.svg"
curl -o salad.svg "$BASE_URL/1F957.svg"

# Emotions (8)
curl -o happy.svg "$BASE_URL/1F600.svg"
curl -o smiling.svg "$BASE_URL/1F60A.svg"
curl -o sad.svg "$BASE_URL/1F622.svg"
curl -o angry.svg "$BASE_URL/1F620.svg"
curl -o tired.svg "$BASE_URL/1F634.svg"
curl -o sick.svg "$BASE_URL/1F912.svg"
curl -o confused.svg "$BASE_URL/1F615.svg"
curl -o love.svg "$BASE_URL/2764.svg"

# Places (7)
curl -o home.svg "$BASE_URL/1F3E0.svg"
curl -o office.svg "$BASE_URL/1F3E2.svg"
curl -o school.svg "$BASE_URL/1F3EB.svg"
curl -o store.svg "$BASE_URL/1F3EA.svg"
curl -o restaurant.svg "$BASE_URL/1F37D.svg"
curl -o subway.svg "$BASE_URL/1F687.svg"
curl -o church.svg "$BASE_URL/26EA.svg"

# Objects (10)
curl -o phone.svg "$BASE_URL/1F4F1.svg"
curl -o book.svg "$BASE_URL/1F4D6.svg"
curl -o car.svg "$BASE_URL/1F697.svg"
curl -o money.svg "$BASE_URL/1F4B0.svg"
curl -o watch.svg "$BASE_URL/231A.svg"
curl -o clothes.svg "$BASE_URL/1F454.svg"
curl -o bed.svg "$BASE_URL/1F6CF.svg"
curl -o chair.svg "$BASE_URL/1FA91.svg"
curl -o tv.svg "$BASE_URL/1F4FA.svg"
curl -o door.svg "$BASE_URL/1F6AA.svg"

# People & Family (5)
curl -o man.svg "$BASE_URL/1F468.svg"
curl -o woman.svg "$BASE_URL/1F469.svg"
curl -o baby.svg "$BASE_URL/1F476.svg"
curl -o family.svg "$BASE_URL/1F46A.svg"
curl -o friends.svg "$BASE_URL/1F46B.svg"

# Actions (5)
curl -o running.svg "$BASE_URL/1F3C3.svg"
curl -o sleeping.svg "$BASE_URL/1F4A4.svg"
curl -o eating.svg "$BASE_URL/1F374.svg"
curl -o walking.svg "$BASE_URL/1F6B6.svg"
curl -o working.svg "$BASE_URL/1F4BC.svg"

# Weather (6)
curl -o sunny.svg "$BASE_URL/2600.svg"
curl -o cloudy.svg "$BASE_URL/26C5.svg"
curl -o rainy.svg "$BASE_URL/1F327.svg"
curl -o snow.svg "$BASE_URL/2744.svg"
curl -o temperature.svg "$BASE_URL/1F321.svg"
curl -o weather.svg "$BASE_URL/1F324.svg"

# Transportation (6)
curl -o bus.svg "$BASE_URL/1F68C.svg"
curl -o train.svg "$BASE_URL/1F686.svg"
curl -o airplane.svg "$BASE_URL/2708.svg"
curl -o bicycle.svg "$BASE_URL/1F6B4.svg"
curl -o taxi.svg "$BASE_URL/1F695.svg"
curl -o scooter.svg "$BASE_URL/1F6F5.svg"

# Work & Education (6)
curl -o businessman.svg "$BASE_URL/1F468-200D-1F4BC.svg"
curl -o teacher.svg "$BASE_URL/1F468-200D-1F3EB.svg"
curl -o doctor.svg "$BASE_URL/1F468-200D-2695-FE0F.svg"
curl -o writing.svg "$BASE_URL/1F4DD.svg"
curl -o computer.svg "$BASE_URL/1F4BB.svg"
curl -o books.svg "$BASE_URL/1F4DA.svg"

# Time (4)
curl -o calendar.svg "$BASE_URL/1F4C5.svg"
curl -o alarm.svg "$BASE_URL/23F0.svg"
curl -o morning.svg "$BASE_URL/1F305.svg"
curl -o night.svg "$BASE_URL/1F303.svg"

# Sports (5)
curl -o soccer.svg "$BASE_URL/26BD.svg"
curl -o basketball.svg "$BASE_URL/1F3C0.svg"
curl -o music.svg "$BASE_URL/1F3B5.svg"
curl -o gaming.svg "$BASE_URL/1F3AE.svg"
curl -o camera.svg "$BASE_URL/1F4F7.svg"

echo "✅ Downloaded 70 emojis for A1/A2 learners!"
echo "📁 Location: /Users/alipala/github/MyTacoAIMobile/src/assets/emojis/"
