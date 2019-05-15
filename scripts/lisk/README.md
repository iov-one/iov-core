# Starting a local Lisk blockchain

Starts a local Lisk blockchain with genesis block in
https://github.com/LiskHQ/lisk/blob/v1.2.0/config/devnet/genesis_block.json.

This account owns 100 million initial supply:

- 16313739661670634666L
- c094ebee7ec0c50ebee32918655e089f6e1a604b83bcaa760293c61e0f18ab6f
- wagon stock borrow episode laundry kitten salute link globe zero feed marble

## Requirements

- docker and docker-compose

## Start

From repo root:

```
./scripts/lisk/start.sh
./scripts/lisk/init.sh
export LISK_ENABLED=1
```

## Initialize

The faucet account

- 9061425315350165588L
- m/1229936198'/1'/0'/0'
- wagon stock borrow episode laundry kitten salute link globe zero feed marble

is loaded with 10000 LSK.

The account 2222222L has no keypair and only receives funds (1.4455 LSK).

The account

- 1349293588603668134L
- e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6
- parrot idle tattoo cheese island stand adult reunion tool tell neglect abandon

gets an initial amount of money and initializes its public key.

## Stop

From repo root:

```
./scripts/lisk/stop.sh
unset LISK_ENABLED
```

## How to get the genesis accounts

```
$ git clone --branch 1.2.0 https://github.com/LiskHQ/lisk.git
$ cd lisk
$ npm install
$ node
> .editor
const lisk = require("lisk-elements");
const config = require("./config/devnet/config");

for (const delegate of config.forging.delegates) {
    const passphrase = lisk.cryptography.decryptPassphraseWithPassword(
        lisk.cryptography.parseEncryptedPassphrase(delegate.encryptedPassphrase),
        config.forging.defaultPassword
    );
    const { address, publicKey } = lisk.cryptography.getAddressAndPublicKeyFromPassphrase(passphrase);
    console.log(`${address},${publicKey},${passphrase}`);
}
^D
```

leads to

```csv
8273455169423958419L,9d3058175acab969f41ad9b86f7a2926c74258670fe56b37c429c01fca9f2f0f,robust swift grocery peasant forget share enable convince deputy road keep cheap
12254605294831056546L,141b16ac8d5bd150f16b1caa08f689057ca4c4434445e56661831f4e671b7c0a,weapon van trap again sustain write useless great pottery urge month nominee
14018336151296112016L,3ff32442bb6da7d60c1b7752b24e6467813c9b698e0f278d48c43580da972135,course genuine appear elite library fabric armed chat pipe scissors mask novel
2003981962043442425L,5d28e992b80172f38d3a2f9592cad740fd18d3c2e187745cd5f7badf285ed819,unknown critic shield network goat detail grid dry surround clay wrap six
15685993315437640088L,4fe5cd087a319956ddc05725651e56486961b7d5733ecd23e26e463bf9253bb5,head miracle inquiry body salt hedgehog purity tilt kit magic chat evolve
13796903232533379929L,a796e9c0516a40ccd0eee7a32fdc2dc297fee40a9c76fef9c1bb0cf41ae69750,trial offer detail flee gadget elevator fix unhappy panda ordinary goat glide
10395427086746342233L,67651d29dc8d94bcb1174d5bd602762850a89850503b01a5ffde3b726b43d3d2,pencil rescue over bachelor team rib venue broom axis bonus nominee volcano
10555862272344793163L,c3d1bc76dea367512df3832c437c7b2c95508e140f655425a733090da86fb82d,latin swamp simple bridge pilot become topic summer budget dentist hollow seed
9090572627256317041L,640dfec4541daed209a455577d7ba519ad92b18692edd9ae71d1a02958f47b1b,acid catch quit barely siege smile witness pass artwork forget quote disease
6147291942291731858L,3ea481498521e9fb1201b2295d0e9afa826ac6a3ef51de2f00365f915ac7ac06,eye split major insect please across index taste mention drastic alert fault
1478505779553195737L,5c4af5cb0c1c92df2ed4feeb9751e54e951f9d3f77196511f13e636cf6064e74,topic arena assault must dolphin team fine ranch robust green cruise expect
3485190523478756562L,399a7d14610c4da8800ed929fc6a05133deb8fbac8403dec93226e96fa7590ee,deer myself jaguar swarm mistake start club search theme hope flip tag
7749538982696555450L,6e904b2f678eb3b6c3042acb188a607d903d441d61508d047fe36b3c982995c8,warfare mask code net chronic dress case toss celery unable pact obscure
11858068254874463650L,1af35b29ca515ff5b805a5e3a0ab8c518915b780d5988e76b0672a71b5a3be02,life express when pepper mechanic goat again sustain announce decrease legend concert
11959294293312794939L,d8daea40fd098d4d546aa76b8e006ce4368c052ffe2c26b6eb843e925d54a408,hidden view brave foot early you latin globe elite maid unlock student
6572481065061292413L,386217d98eee87268a54d2d76ce9e801ac86271284d793154989e37cb31bcd0e,lounge label clap camera zebra junk analyst citizen arrest caution odor figure
537318935439898807L,86499879448d1b0215d59cbf078836e3d7d9d2782d56a2274a568761bff36f19,recipe bomb asset salon coil symbol tiger engine assist pact pumpkin visit
11194005483892021001L,948b8b509579306694c00833ec1c0f81e964487db2206ddb1517bfeca2b0dc1b,famous weapon poverty blast announce observe discover prosper mystery adapt tuna office
12689367895996075612L,b00269bd169f0f89bd2f278788616521dd1539868ced5a63b652208a04ee1556,defy defense guard sauce tip film glad horror foam kiss panda weekend
12937672077630275226L,e13a0267444e026fe755ec128858bf3c519864631e0e4c474ba33f2470a18b83,journey egg tool shaft upset erode decrease stuff extra federal again soda
6719024567117648644L,1cc68fa0b12521158e09779fd5978ccc0ac26bf99320e00a9549b542dd9ada16,cupboard gym plastic goose honey humble cattle dynamic boring chief vital perfect
2185933284430885504L,a10f963752b3a44702dfa48b429ac742bea94d97849b1180a36750df3a783621,donate random boring charge reason brick false police stamp plunge tape level
263761216888896549L,f33f93aa1f3ddcfd4e42d3206ddaab966f7f1b6672e5096d6da6adefd38edc67,middle time skate claim planet piano two crawl toilet heavy because long
6996737717246838071L,b5341e839b25c4cc2aaf421704c0fb6ba987d537678e23e45d3ca32454a2908c,flavor type stone episode capable usage save sniff notable liar gas someone
17769700073017685523L,da673805f349faf9ca1db167cb941b27f4517a36d23b3c21da4159cff0045fbe,game balance venue jacket volume typical advice design gentle rib drink shock
18101328368221611426L,55405aed8c3a1eabe678be3ad4d36043d6ef8e637d213b84ee703d87f6b250ed,draw ocean damp thank sauce ready light cupboard ball hat hero enact
3654804916322462690L,19ffdf99dee16e4be2db4b0e000b56ab3a4e10bee9f457d8988f75ff7a79fc00,era tube inspire unhappy august change eternal dose tooth tape december private
6214967903930344618L,85b07e51ffe528f272b7eb734d0496158f2b0f890155ebe59ba2989a8ccc9a49,swarm height soul jump cancel mountain blouse pass zero catalog shallow surround
6700417780469657062L,8a0bcba8e909036b7a0fdb244f049d847b117d871d203ef7cc4c3917c94fd5fd,cheese retreat stone point episode fiber chef chief nest shuffle crush any
17416795040643460696L,95ea7eb026e250741be85e3593166ef0c4cb3a6eb9114dba8f0974987f10403f,illegal reveal summer stomach cover laugh victory mother blush subway certain lock
7806545753492919148L,cf8a3bf23d1936a34facc4ff63d86d21cc2e1ac17e0010035dc3ef7ae85010dc,olympic fatigue end humor base later olympic pony salmon crash kind enforce
16807489144327319524L,82174ee408161186e650427032f4cfb2496f429b4157da78888cbcea39c387fc,secret allow steak summer chase gate tongue cereal indoor delay bring fee
11009807324631489084L,4bde949c19a0803631768148019473929b5f8661e9e48efb8d895efa9dd24aef,agent grain helmet entry oblige tag pipe omit width lake lend enjoy
5380829552614149409L,2f9b9a43b915bb8dcea45ea3b8552ebec202eb196a7889c2495d948e15f4a724,doll special grid student gaze almost receive candy scrub say sphere sunset
18181157191600196376L,9503d36c0810f9ac1a9d7d45bf778387a2baab151a45d77ac1289fbe29abb18f,shadow donkey fall satisfy resemble hotel resource plastic throw soup change science
15279149762694772854L,a50a55d4476bb118ba5121a07b51c185a8fe0a92b65840143b006b9820124df4,burden ski shock write student gown sugar oppose grass voyage have stable
15867701141673224975L,fc8672466cc16688b5e239a784cd0e4c0acf214af039d9b2bf7a006da4043883,retire gallery fury question rose jealous shuffle equip water call follow rely
13787002016364430124L,db821a4f828db977c6a8d186cc4a44280a6ef6f54ac18ec9eb32f78735f38683,flip relief play educate address plastic doctor fix must frown oppose segment
5312766513260345125L,ba7acc3bcbd47dbf13d744e57f696341c260ce2ea8f332919f18cb543b1f3fc7,wing ring rate erase horse double duty situate guitar color resist unit
11613981515632820140L,47c8b3d6a9e418f0920ef58383260bcd04799db150612d4ff6eb399bcd07f216,assist congress future wheel aisle mammal else giant buddy point purpose cook
4351572711388220555L,d1c3a2cb254554971db289b917a665b5c547617d6fd20c2d6051bc5dfc805b34,gallery wasp task access remind dust mushroom choose mushroom middle oval yellow
11595026565287740051L,47b9b07df72d38c19867c6a8c12429e6b8e4d2be48b27cd407da590c7a2af0dc,invite divide cry retreat shy agent pledge sorry knee vacuum uniform kingdom
3466073897179860882L,9a7452495138cf7cf5a1564c3ef16b186dd8ab4f96423f160e22a3aec6eb614f,horn antenna tenant convince drum like later bubble kitten system hazard crazy
4331258378288911563L,c4dfedeb4f639f749e498a2307f1545ddd6bda62e5503ac1832b122c4a5aedf9,brief empower hub antenna milk impose stage comic twenty hunt morning thank
9928719876370886655L,96c16a6251e1b9a8c918d5821a5aa8dfb9385607258338297221c5a226eca5c6,route bind pencil sniff medal when bone refuse juice caution space shiver
11805364634236927749L,910da2a8e20f25ccbcb029fdcafd369b43d75e5bc4dc6d92352c29404acc350f,require ankle exhibit umbrella endorse express inquiry unique jacket element symbol cotton
9703017731198160198L,eabfe7093ef2394deb1b84287f2ceb1b55fe638edc3358a28fc74f64b3498094,flock butter pole attitude remain science minor disorder soldier rookie organ light
162664226572374905L,94b163c5a5ad346db1c84edaff51604164476cf78b8834b6b610dd03bd6b65d9,monkey admit festival oxygen neither buddy vapor apart cycle carpet glow artwork
14754807200586084685L,6164b0cc68f8de44cde90c78e838b9ee1d6041fa61cf0cfbd834d76bb369a10e,jaguar rifle leader thing lottery index north industry express access typical illegal
6596445655213033387L,3476bba16437ee0e04a29daa34d753139fbcfc14152372d7be5b7c75d51bac6c,leaf liberty slender corn effort advice clerk blast grid icon orange nominee
2581762640681118072L,01389197bbaf1afb0acd47bbfeabb34aca80fb372a8f694a1c0716b3398db746,outdoor right flat quarter cancel stadium urban law rhythm club spatial muscle
15064680481049926459L,aa33af13b440746b4f24312cba5fa910eb077ce6b16b84ebb482cb7720b5c686,web evolve empty assault trim service choose increase sister box wet depth
6253486079725348800L,6f04988de7e63537c8f14e84b0eb51e0ea9c5da8b4b9256243b3e40b1aeccb76,fortune project stable road outside spoil team quantum journey fall cloud great
7838076639178338424L,07935c642c7409c365258c8488760e96a851cee618aec72eeeb135c9c827f0f9,satoshi summer poet acid absorb useful hedgehog turn sure true crunch library
9824483707960713406L,526931663cbee883ff22369172cba091a5dd5fa1200284fa790d7aeca53d37af,lake either purchase wall core move broken accident install family region spawn
12144255005482188703L,f7b9751d59dd6be6029aa36a81a3f6436e2970cf4348845ab6254678fb946c18,betray banana sketch have risk coral stumble invest poverty panic step menu
2037513790649430470L,5f6cc5a8aac752d37c676b0d46a798f7625e37dfa1e96091983274e04ab7ffe2,age solar olive fine scheme soon alert grass section infant fiscal real
2371768942272884594L,9c16751dbe57f4dff7b3fb8911a62c0cb2bdee6240e3f3fefe76832788cb14c6,subject clip engage orphan agree major marriage arrow friend assault element ankle
309766985700168161L,ba2ea5e324eeb42fa6f4d1132a1d79911721e8507033bb0abd49715f531877b4,pipe goddess avoid earth fault limb ecology agent wall glimpse access worth
17110047919889272525L,0186d6cbee0c9b1a9783e7202f57fc234b1d98197ada1cc29cfbdf697a636ef1,know chat master congress slam property ability leave daughter hover nose wing
17271297386479765505L,edbb9828fbe62da2a59afbc8623e8ebc5ed2f9b7f77a0cd1cdcf55edea30521c,kiss badge wreck ask crumble appear game entry smart world clown canyon
11229203525038722103L,b6ac700bf890b887e218dbd55b8f6b091dfc5a684d0fd7a6f69db7dc0313b51b,join bid whale slender rapid gauge about access slice calm leaf chair
1998811414849260567L,62bbb3c41e43df73de2c3f87e6577d095b84cf6deb1b2d6e87612a9156b980f8,fiction judge vanish tape liberty chronic nerve unique sibling arch match away
1039287838469525702L,6fb2e0882cd9d895e1e441b9f9be7f98e877aa0a16ae230ee5caceb7a1b896ae,enact inquiry insect pluck paper venture faith angry diesel enter tray muffin
9829702676947904862L,9a0f19e60581003b70291cf4a874e8217b04871e676b2c53c85a18ab95c2683b,autumn foil east grape walnut mother hello favorite wink shaft fancy about
11776976371460504977L,1e6ce18addd973ad432f05f16a4c86372eaca054cbdbcaf1169ad6df033f6b85,imitate tenant wreck vacuum green image crack abandon copper side spell this
10718602563400390049L,27f43391cca75cbc82d1750307649508d1d318cd015f1f172b97318f17ab954e,daring comfort trophy sketch dilemma hour lunar coffee riot kick elevator taste
3978875557882351502L,644a971f2c0d0d4b657d050fca27e5f9265e3dfa02a71f7fbf834cc2f2a6a4c8,clock artwork supreme super join sea shiver never answer bring thought solution
15196907279410793719L,cdd68a321ea737e82bce23d2208040f79471d36f2e6f84c74ea36ab26245e522,party wet point science surge blanket sniff oak cram pupil excuse nasty
14846615469478045551L,f9f6ff873c10c24eba834be28a56415a49c9c67b7c0ee9f106da827847168986,simple before tortoise spike raven fever genre chat pattern noble boring this
9528507096611161860L,fab7b58be4c1e9542c342023b52e9d359ea89a3af34440bdb97318273e8555f0,matrix favorite pole blur whale bike ribbon search impact good merry umbrella
5225235021585670513L,1b5a93c7622c666b0228236a70ee1a31407828b71bfb6daaa29a1509e87d4d3c,ceiling prison resource twenty cage reject figure around place floor afford worth
8579664070066716758L,74583aba9c0b92e4f08c8c75e6df341c255ca007971195ff64d6f909dc4b7177,weather vendor accuse grow rely diagram rebuild borrow forward eager brand walnut
13607583239938732846L,2b6f49383af36fd9f1a72d5d2708c8c354add89aaea7edc702c420e2d5fdf22e,lend crime turkey diary muscle donkey arena street industry innocent network lunar
2460251951231579923L,a10ed9c59dac2c4b8264dc34f2d318719fb5f20ecdd8d6be2d7abfe32294f20d,wait know goose ordinary draft embrace three super fog portion fog jewel
1081724521551096934L,c61d0822bbdbfe2a0b5503daff0ce8441c623115c94c0cfcf047a51f8b7160d3,despair broom face hamster field account aware armor blame clean ship genre
11004588490103196952L,031e27beab583e2c94cb3167d128fc1a356c1ae88adfcfaa2334abffa3ae0b4c,sad axis cruise false buzz jelly east congress jacket riot domain eyebrow
3038510178697972178L,9986cedd4b5a28e4c81d9b4bff0461dddaa25099df00b8632fe99e88df28ce73,brother absurd apple vital shove hockey catalog all spring denial coffee spring
11506830473925742632L,03e811dda4f51323ac712cd12299410830d655ddffb104f2c9974d90bf8c583a,lizard trigger price mechanic total affair proof ocean team hammer board blur
1156554003019098747L,64db2bce729e302f6021047dfd39b6c53caf83b42da4b5b881cb153a3fb31613,return nerve sort strategy wink lake fringe metal under grape rule vacuum
15675505605575781355L,f827f60366fae9f9ed65384979de780f4a18c6dbfbefb1c7d100957dde51a06d,vessel universe profit comic dust milk dolphin chronic range habit section apple
1330932780504881464L,68680ca0bcd4676489976837edeac305c34f652e970386013ef26e67589a2516,copy leisure enforce ice floor coyote dash cradle phrase admit fish yellow
2393437289429474816L,f25af3c59ac7f5155c7a9f36762bd941b9dc9c5c051a1bc2d4e34ed773dd04a3,column spin grain broom blur uniform tennis miss fault quarter idle dilemma
9373453086736696113L,d3e3c8348bca51461eabfc382f8a01e8e284db54104ad37ec0695d48ae5531ac,term stable snap size half hotel unique biology amateur fortune easily tribe
13996264772258038665L,3be2eb47134d5158e5f7d52076b624b76744b3fba8aa50791b46ba21408524c9,tiger festival soldier deputy rich drink father vapor type produce moral better
15441829200899900957L,9f2fcc688518324273da230afff9756312bf23592174896fab669c2d78b1533c,category burden churn buddy crowd drink wedding exercise submit jaguar lounge final
9617151563281131501L,e818ac2e8e9ffacd2d49f0f2f6739e16711644194d10bb1a8e9e434603125fa1,correct awful month shift govern snack small ridge bitter shop luxury sun
11231201826468807624L,19d55c023d85d6061d1e196fa440a50907878e2d425bcd893366fa04bc23b4de,soup situate eternal used base dune depart segment satisfy carbon suspect zone
8696372244926065755L,6d462852d410e84ca199a34d7ccad443784471f22cf3de37c531ce3b87ebbc41,decline where harsh alarm spoon consider filter razor energy boil history blur
13227119536266737242L,e6d075e3e396673c853210f74f8fe6db5e814c304bb9cd7f362018881a21f76c,prosper waste art carpet model settle license matrix lion exist much already
5179180534922237219L,0779ca873bbda77f2850965c8a3a3d40a6ee4ec56af55f0a3f16c7c34c0f298b,rally one magnet dune junior panic head token direct choose win place
15357346183081898956L,73fec19d4bfe361c0680a7cfd24b3f744a1c1b29d932c4d89ce6157679f8af7d,urban grunt panther voice drink famous such useful tiny race heavy best
5728878764625100394L,1e82c7db09da2010e7f5fef24d83bc46238a20ef7ecdf12d9f32e4318a818777,imitate brain only inhale fancy garment exercise promote extend reopen help festival
15692920659979620367L,e42bfabc4a61f02131760af5f2fa0311007932a819a508da25f2ce6af2468156,void annual occur spice elephant spring good ski myself away share lesson
9950029393097476480L,bf9f5cfc548d29983cc0dfa5c4ec47c66c31df0f87aa669869678996902ab47f,false narrow garage menu valve universe come lava uncle domain episode climb
13047943150548380336L,b137de324fcc79dd1a21ae39a2ee8eed05e76b86d8e89d378f8bb766afb8719f,armed senior cage sing example piece syrup curtain renew swap slush field
677098303101863197L,31402977c7eaf9e38d18d0689a45d719d615de941f7e80f6db388453b46f4df5,option print luggage drill staff addict myth route confirm legal peanut nurse
68059329122227204L,f62062b7590d46f382fb8c37a26ab0a1bd512951777aedcaa96822230727d3a1,place lawsuit turkey trophy key recall young bench mask drink mutual embody
15300035861842713585L,76c9494237e608d43fd6fb0114106a7517f5503cf79d7482db58a02304339b6c,sibling matter suspect marine clean glory amused egg bean transfer profit addict
10881167371402274308L,addb0e15a44b0fdc6ff291be28d8c98f5551d0cd9218d749e30ddb87c6e31ca9,actress route auction pudding shiver crater forum liquid blouse imitate seven front
6726252519465624456L,904c294899819cce0283d8d351cb10febfa0e9f0acd90a820ec8eb90a7084c37,jump bicycle member exist glare hip hero burger volume cover route rare
```
