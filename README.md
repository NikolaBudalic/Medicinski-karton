Projekat koji se radi na vežbama iz predmeta Mobilne Tehnologije, studentska godina 2025/26.

Potrebno je klonirati repozitorijum na svoj računar (preporučujem korišćenje GitHub Desktop aplikacije), ili download-ovati u vidu zip fajla. U slučaju da se koristi emulator, neophodno je imati instaliran i podešen Android Studio, a u slučaju da se koristi fizički mobilni telefon, aplikacija Expo Go omogućava izvršavanje na njemu.

Kada se preuzme izvorni kod, u komandnoj liniji Visual Studio Code-a (view->terminal) pokrenuti komandu za instaliranje svih zavisnosti - "npm install" (bez navodnika, naravno). Ova komanda će instalirati sve zavisnosti koje se nalaze u package.json datoteci.

Takođe, možete kreirati novi projekat kod sebe na računaru, i samo određene fajlove (ili njihove delove) preuzeti iz ovog projekta.

Ako naiđete na probleme, javite mi se putem mejla ili pitajte na vežbama.

N

## Objavljivanje na GitHub

Ako želite da objavite ovaj projekat na GitHub (repozitorijum nazvan "Medicinski karton"), pratite ove korake lokalno u terminalu. Zamenite `USERNAME` sa vašim GitHub korisničkim imenom i `Medicinski-karton` sa tačnim imenom repozitorijuma ako je drugačije.

- Inicijalizujte git (ako već nije):

```bash
git init
git add -A
git commit -m "Initial commit"
```

- Dodajte udaljeni repozitorijum i push-ujte na `main` granu:

```bash
# Ako ste već kreirali repozitorijum na GitHub-u putem veb interfejsa:
git remote add origin https://github.com/USERNAME/Medicinski-karton.git
git branch -M main
git push -u origin main
```

- Alternativa koristeći `gh` CLI (ako imate instaliran `gh` i prijavljeni ste):

```bash
gh repo create USERNAME/Medicinski-karton --public --source=. --remote=origin --push
```

- Napomena o imenu repozitorijuma: GitHub obično koristi bez razmaka u URL-u (umesto razmaka se često koristi `-`). Ako ste kreirali repozitorijum sa razmakom, proverite tačan URL na GitHub stranici repozitorijuma i koristite ga u `git remote add` komandi.

- Dodatno: u [`.gitignore`](.gitignore) sam dodao tipične stavke koje ne treba slati na GitHub (npr. `node_modules`, `.env`).

Ako želite, mogu sada da pokrenem naredbe `git` u vašem terminalu (push će vam možda tražiti lozinku ili 2FA). Želite li da to uradim? Ili da vam pomognem sa tačnim URL-om repozitorijuma (pošaljite vaš GitHub username)?
