Meeting 1 (7/10/2019)
    Task 2, basic framework: (Dirk en Martijn)
        Website runt, socket io geimplementeerd
        inloggen en met socket communiceren
        device inloggen als master of slave
        functionaliteiten: 
            achtergrond clients veranderen
            draw direction
            countdown
            picturemode, cameratoegang in orde
            picture upload, picture kiezen, uploaden zelf moet nog gebeuren
        Tegen volgende week:
            - picture upload klaar
            - picture mode (livestream), klaar
            - Verslag begonnen
            - code review gebeuren (Seppe)
                samen afspreken voor uitleg
            - master herorganiseren, opkuisen

    Task 3, device recognition: (Seppe, Bert en Toon)
        Screen detection werkt in openCV
        Identificatie onderzocht wat het beste is, wordt getest
        Tegen volgende week:
            - zorgen dat openCV niet meer nodig is
            - begin aan identificatie
            - omkaderen van schermen om afbeelding op af te beelden
            - eventueel beginnen reviewen (Martijn), kan ook verplaatst worden naar volgende week

Meeting 2 (14/10/2019)
    Task 2, basic framework: (Dirk en Martijn)
        -> codereviewer = Seppe
        functionaliteiten:
            - foto's uploaden
            - zien master/clients
        code review begonnen, nog vraag wat er in paragraaf tekst moet
        verslag vandaag aan beginnen --> grootte?
        Vandaag vooral focus op verslag
    Task 3, device recognition: (Seppe, Bert en Toon)
        alles nu zonder openCV
        laattijd met/zonder openCV?
        island-detector (Bert) om schermen te herkennen (zonder identificatie)
        Martijn al begonnen aan codereviewer
        Tegen volgende week:
            - identificatie, wat en hoe?
                - Dirk stelt "kleurenbarcode" voor -> proberen dit uit te werken
            - rotatie herkennen
            - begin verslag    
            - Martijn verder code reviewen

Meeting 3 (21/10/2019)
	Task 2 --> finished
	Task 3, device recognition (iedereen):
		identificatie met kleurenbarcode, werkt
		rotatie werkt
		Vandaag:
			- verslag
			- automatische testen schrijven
	Task 4-5, vanaf morgen aan beginnen

Meeting 4 (28/10/2019)
    Task 4: (Martijn, Seppe en Bert)
        - Heel veel werk
        - Er is nog niet zoveel, moeten even samenzitten en samendenken
        Tegen volgende week:
            - zien dat het af is
            - zelf zodadelijk met 3 deadlines afspreken
    Task 5: (Dirk, Frédéric, Toon)
        - Triangulation goed begonnen, lastig maar zal wel lukken
        - Image beetje aangepast en screen om gemakkelijker te communiceren
        - Bezig met implementeren client
        - Triangulation is voor Frédéric en Toon
        - Dirk houdt zich vooral bezig met implementatie screen detection

Meeting 5 (04/11/2019)
    Task 4: (Martijn, Seppe en Bert)
        - Overlap hoeken zoeken werkt
        - nu
            - testen maken
            - verslag schrijven
    Task 5: (Dirk, Frédéric, Toon)
        - Delaunay triangulatie is perfect
        - nu
            - triangulatie displayen (Dirk)
            - verslag schrijven
    Algemeen:
        - 21u verslagen klaar om na te lezen
        - Tegen volgende week:
            - task 6 (Dirk, Seppe)
            - task 7 (Martijn, Bert)
            - Opruimen en optimaliseren (Toon, Frédéric)
