<h1 align="center">
  <br>
  <a href="https://github.com/euisungkang/Wavy"><img src="https://i.ibb.co/Sm651sh/Wavy-Cover-2-HD.png" alt="【 𝓦 𝓪 𝓿 𝔂 】"></a>
  <br>
  【 𝓦 𝓪 𝓿 𝔂 】
  <br>
</h1>

<h4 align="center">Ｃｕｒｒｅｎｃｙ， Ｍｕｓｉｃ， Ｍｏｄｅｒａｔｉｏｎ</h4>

<p align="center">
  <a>
    <img src="https://i.ibb.co/hDtSCyV/Screenshot-2023-12-04-at-12-30-46-AM.png" alt="Total Users" height="22px">
  </a>
  <a href="https://nodejs.org">
     <img alt="node.js" src="https://img.shields.io/badge/nodejs-16.11-7bb864">
  </a>
  <a href="https://www.npmjs.com/package/npm">
    <img alt="npm" src="https://img.shields.io/badge/npm-10.2%20%7C%2010.1-1d7ec0">
  </a>
  <a href="https://www.npmjs.com/package/discord.js">
     <img src="https://img.shields.io/badge/discordjs-14.14.1-5d6af3" alt="discord.js">
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a>
  •
  <a href="#installation">Installation</a>
  •
  <a href="#features">Features</a>
  •
  <a href="#join-the-community">Community</a>
  •
  <a href="#license">License</a>
</p>

# Overview
【 𝓦 𝓪 𝓿 𝔂 】 ｉｓ ｙｏｕｒ ｌｏｃａｌ ｖａｐｏｒｗａｖｅ ａｓｓｉｓｔａｎｔ

- 𝓒𝓾𝓻𝓻𝓮𝓷𝓬𝔂 : Earn Wavy Bucks for your time and contribution
- 𝓜𝓪𝓻𝓴𝓮𝓽 : Exchange in-server perks (badges, roles)
- 𝓡𝓪𝓯𝓯𝓵𝓮𝓼 : Exchange real-world perks (giftcards, coupons)
- 𝓒𝓪𝓼𝓲𝓷𝓸 : Gamble away against 𝓦 𝓪 𝓿 𝔂 members or the house
- 𝓜𝓾𝓼𝓲𝓬 : Hand-selected and curated 𝓦 𝓪 𝓿 𝔂 lo-fi radio
- 𝓡𝓮𝓬𝓮𝓲𝓹𝓽 : Track all your earnings and spendings

# Installation
**【 𝓦 𝓪 𝓿 𝔂 】 is currently privately shared**

Soon to be released publicly!

# Features
### 𝓒𝓾𝓻𝓻𝓮𝓷𝓬𝔂
<img alt="Currency" src="https://i.ibb.co/GFpjfnX/Wide-HD.png"><br>
Unlike other *Economy/Currency* Discord bots, 【 𝓦 𝓪 𝓿 𝔂 】 rewards users by **time spent** in voice channels.<br>Thus, more active members earn significantly more. <br>
A major consideration was the amount of theoretical traffic when users are active all at once. The original approach (assigning a dedicated listener to every user) quickly became a problem as the userbase increased:<br><br>

<figure style="display: flex;">
  <img alt="oldCurrency" src="./media/oldCurrency.png" style="width: 65vw"/>
  <p style="font-size: 11px; align-self: center; padding: 1em">Time: O(n)<br>Space: O(n)</p>
  <figcaption>
</figure><br>

Although JS's native asynchronous feature made for a simple and easy to implement solution, given users = n, time/space complexity of O(n) could be improved. To address said issue:

<figure style="display: flex;">
  <img alt="newCurrency" src="./media/newCurrency.png" style="width: 65vw"/>
  <p style="font-size: 11px; align-self: center; padding: 1em">Time: O(1)<br>Space: O(n)</p>
  <figcaption>
</figure><br>

An external database (Firestore) and Discord's voiceStateUpdate() feature allowed for a single, centralized listener to handle all voice channel connects and disconnects. Thus, improving time complexity to O(1), and significantly reducing the size of stored data from Event Listeners to a Date object.<br><br>

𝓒𝓾𝓻𝓻𝓮𝓷𝓬𝔂 calculation is performed while considering **inflation** across all servers:<br>
$$Earnings\ Per\ User\ (EPU) = \dfrac{∀earnings\ +\ ∀spendings}{total\ number\ of\ users}$$
$$CPI = \dfrac{EPU(∀servers)\ -\ EPU(server\ x)}{EPU(server\ x)}\ + \ 1$$
$$if\ CPI\ < 0,\ CPI = 0$$
$$Currency = \Big\lfloor \dfrac{(time\ connected\ -\ time\ disconnected) * CPI}{rate * 1000}\Big\rfloor$$

$rate$ is base of 5, increased to 3 for server boosters

### 𝓜𝓪𝓻𝓴𝓮𝓽
<img alt="Market" src="https://i.ibb.co/LCQV9xg/Wide-HD.png">

### 𝓡𝓪𝓯𝓯𝓵𝓮𝓼
<img alt="Raffles" src="https://i.ibb.co/r37ZyV7/Wide-HD.png">

### 𝓒𝓪𝓼𝓲𝓷𝓸
<img alt="Casino" src="https://i.ibb.co/dQQcVgR/Wide-HD.png">

### 𝓜𝓾𝓼𝓲𝓬 
<img alt="Music" src="https://i.ibb.co/YXVjdLy/Wide-HD.png">

### 𝓡𝓮𝓬𝓮𝓲𝓹𝓽
<img alt="Receipts" src="https://i.ibb.co/xGXsy0P/Wide-HD.png">

# Join the community!


# License

Artwork created by [Midjourney AI](https://www.midjourney.com/explore).

Released under the [MIT](LICENSE) license.
