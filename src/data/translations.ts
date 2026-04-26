/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 * 
 * translations.ts
 * 
 * Centralized dictionary for UI strings in German and English.
 */

export const TRANSLATIONS = {
  de: {
    common: {
      home: 'Home',
      features: 'Funktionen',
      successStories: 'Erfolgsgeschichten',
      about: 'Über uns',
      backToDashboard: 'Zum Dashboard',
      startNow: 'Pfad wählen',
      getStartedFree: 'Jetzt kostenlos starten',
      watchDemo: 'Demo ansehen',
      language: 'Sprache',
      selectGoal: 'Wähle dein Ziel',
      startPersonalized: 'Starte personalisiert auf dich zugeschnitten',
      startHere: 'Hier starten',
      cancel: 'Abbrechen',
      save: 'Speichern',
      pause: 'Pause',
      replay: 'Abspielen',
      ok: 'OK',
      problem: 'Fehler!',
      resume: 'Fortsetzen',
      stopAndSave: 'Stopp & Speichern',
      total: 'Gesamt',
      cost: 'Kosten',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      saveChanges: 'ÄNERUNGEN SPEICHERN',
      saveSession: 'FAHRSTUNDE SPEICHERN',
      date: 'Datum',
      notes: 'Notizen',
      name: 'Name',
      search: 'SUCHEN',
      loading: 'Laden...',
      close: 'Schließen',
      next: 'Weiter',
      continue: 'Weiter',
      appSubtitle: 'Fahrschule App',
      paths: {
        umschreibung: 'Umschreibung',
        fahrschule: 'Fahrschule',
      },
      transmissions: {
        manual: 'Manuell',
        automatic: 'Automatik',
      },
      tuvDekra: 'TÜV / DEKRA',
      gdprCompliant: 'DSGVO Konform',
      allRightsReserved: 'Alle Rechte vorbehalten.',
      proDriverTech: 'Professionelle Fahrausbildungs-Technologie.',
      nav: {
        home: 'Start',
        curriculum: 'Plan',
        maneuvers: 'Manöver',
        achievements: 'Erfolge',
        review: 'Review',
        tracker: 'Fahrtenbuch',
        finance: 'Geld',
        account: 'Konto',
        mainNav: 'Hauptnavigation',
        mobileNav: 'Mobile Navigation',
        languageSelect: 'Sprachauswahl',
        signOut: 'Abmelden',
        lightMode: 'Heller Modus',
        darkMode: 'Dunkler Modus'
      }
    },
    quiz: {
      greatJob: 'Sehr gut!',
      keepPracticing: 'Weiter üben!',
      resultsSummary: (score: number, total: number) => `Du hast ${score} von ${total} richtig beantwortet`,
      retry: 'Nochmal',
      done: 'Fertig',
      nextQuestion: 'Weiter',
      showResults: 'Ergebnis anzeigen',
      nextQuestionAria: 'Nächste Frage',
      showResultsAria: 'Ergebnis anzeigen',
      restartAria: 'Quiz neustarten',
      closeAria: 'Quiz beenden',
      closeX: 'Quiz schließen',
    },
    welcome: {
      hero: {
        badge: 'Von Experten empfohlen 2026',
        titlePrefix: 'Der schnellste Weg zum',
        titleHighlight: 'deutschen Führerschein',
        subtitle: 'Prüfungsreife mit KI-Coaching, interaktiven Manövern und digitalem Fahrtenbuch.',
        happyStudents: 'Zufriedene Schüler',
        passRate: 'Bestehensquote',
        firstAttempt: 'Erster Versuch',
      },
      features: {
        title: 'Intelligente Funktionen',
        subtitle: 'Alles was du brauchst um deine Prüfung im ersten Anlauf zu bestehen.',
        aiCoaching: {
          title: 'KI Coaching',
          desc: 'Erhalte Echtzeit-Feedback zu deinem Fahrstil und erkenne Fehler bevor sie teuer werden.',
        },
        maneuverReplay: {
          title: 'Manöver-Wiederholung',
          desc: 'Schau dir deine Einpark- und Autobahnmanöver in der 3D-Vorschau an.',
        },
        instructorSync: {
          title: 'Fahrlehrer-Synchronisation',
          desc: 'Teile deinen Fortschritt direkt mit deinem Fahrlehrer für gezieltere Fahrstunden.',
        },
      },
      success: {
        title: 'Schüler-Feedback',
        stories: [
          { name: 'Lukas S.', role: 'Frisch bestanden', text: 'Dank der KI-Analyse wusste ich genau, worauf ich bei der Prüfung achten muss. 10/10!' },
          { name: 'Sarah M.', role: 'Umschreibung', text: 'Die Umschreibung war so einfach. Das digitale Fahrtenbuch hat mir extrem viel Zeit gespart.' },
          { name: 'Marc K.', role: 'Theorie & Praxis', text: 'Beste App auf dem Markt. Die Manöver-Simulationen sind Gold wert!' },
        ]
      },
      about: {
        title: 'Über DriveDE',
        text: 'Unsere Mission ist es, die Fahrausbildung in Deutschland zu digitalisieren. Wir kombinieren modernste KI-Technologie mit jahrzehntelanger Expertise, um dich sicherer und schneller in den Straßenverkehr zu bringen.',
        tags: ['Engineering in Berlin', 'Expertendaten', 'Datenschutz zuerst'],
      },
      paths: {
        manual: { title: 'Führerschein (Schaltung)', desc: 'Der reguläre Weg der Klasse B' },
        automatic: { title: 'Führerschein (Automatik)', desc: 'Klasse B197 - Modern & stressfrei' },
        umschreibungManual: { title: 'Umschreibung (Schaltung)', desc: 'Gültigen Führerschein anerkennen' },
        umschreibungAutomatic: { title: 'Umschreibung (Automatik)', desc: 'Einfache Umschreibung ohne Kupplung' },
      },
    },
    account: {
      title: 'Konto & Profil',
      guestMode: 'Gastmodus aktiv',
      guestDesc: 'Du kannst die App ohne Konto nutzen oder dich anmelden, um später Cloud-Synchronisierung zu aktivieren.',
      signOut: 'Abmelden',
      manageAccount: 'Konto verwalten',
      shareWithInstructor: 'Report mit Fahrlehrer teilen',
      openingGoogle: 'Google wird geöffnet …',
      continueWithGoogle: 'Mit Google fortfahren',
      signInEmail: 'E-Mail anmelden',
      continueGuest: 'Als Gast fortfahren',
      guestNote: 'Google und E-Mail sind optional. Du kannst die App auch komplett im Gastmodus verwenden.',
      learningPath: 'Lernpfad',
      progress: 'Fortschritt',
      lessons: 'Lektionen',
      drivingTime: 'Fahrzeit',
      notSelectedYet: 'Noch nicht gewählt',
      profileSettings: 'Profil-Einstellungen',
      darkMode: 'Dark Mode',
      active: 'Aktiv',
      disabled: 'Deaktiviert',
      on: 'An',
      off: 'Aus',
      languageActive: 'Deutsch aktiv',
      changePath: 'Pfad ändern',
      changePathDesc: 'Manual, Automatik oder Umschreibung neu wählen',
      viewLanding: 'Landing Page ansehen',
      viewLandingDesc: 'Die Startseite mit allen Informationen anzeigen',
      resetProgress: 'Fortschritt zurücksetzen',
      resetProgressDesc: 'Lokale Lernstände und Fahrtenbuch löschen',
      developerTools: 'Entwickler-Tools',
      enableDemo: 'Demo-Modus aktivieren',
      enableDemoDesc: 'App mit Beispieldaten für Videoaufnahmen füllen',
      privacyLegal: 'Datenschutz & Rechtliches',
      privacyLegalDesc: 'DSGVO, AGB, Impressum und Hinweise prüfen',
      instructorReview: 'Fahrlehrer-Review',
      instructorReviewDesc: 'PDF, Musterlektionen und Review-Paket öffnen',
      shareModal: {
        title: 'Fahrlehrer-Sync',
        desc: 'Dein Fahrlehrer kann diesen Code scannen, um deinen aktuellen Lernstand und deine Fahrten zu prüfen.',
        directLink: 'Direkter Link',
        copyLink: 'Link kopieren',
        linkCopied: 'Link kopiert!',
      },
      errors: {
        googleNotConfigured: 'Google-Login ist erst verfügbar, sobald Supabase im Projekt eingerichtet wurde.',
        googleFail: 'Google-Anmeldung konnte nicht gestartet werden.',
        shareSignIn: 'Bitte melde dich zuerst an, um deinen Report zu teilen.',
        userNotFound: 'User ID konnte nicht gefunden werden.',
      }
    },
    budget: {
      title: 'Finanzen',
      costMonitor: 'Kosten-Monitor',
      spentSoFar: 'Bisher ausgegeben',
      totalGoal: 'Voraussichtliches Ziel',
      unlockEstimation: 'SCHÄTZUNG FREISCHALTEN',
      nextSteps: 'Nächste Schritte',
      estLessonsRemaining: 'Geschätzte Fahrstunden',
      normalLessons: 'Normalfahrten',
      specialDrives: 'Sonderfahrten',
      remaining: 'Restbudget',
      yetToBeInvested: 'Noch zu investieren',
      externalFeesNote: 'Exkl. Fremdkosten wie TÜV-Gebühren (~€200).',
      strategyTitle: 'DriveDE Strategie',
      adjustRates: 'Preise anpassen',
      hourlyRate: 'Stundenpreis (45 Min)',
      registrationFee: 'Grundbetrag',
      theoryExam: 'Theorie-Prüf.',
      practicalExam: 'Praxis-Prüf.',
      materials: 'Lernmaterial',
      firstAid: 'Erste Hilfe',
      negativeError: 'Beträge können nicht negativ sein',
      unlockPro: 'PRO FREISCHALTEN',
      savingsPossible: 'Maximale Ersparnis möglich!',
      efficiencyDetected: 'Effizienz-Potential erkannt',
      highReadinessAdvice: 'Deine Bereitschaft ist top. Schließe die Sonderfahrten zügig ab, um unnötige Übungsstunden zu vermeiden.',
      lowReadinessAdvice: (rate: number) => `Fokussiere dich auf Theorie & Simulation. Jede Stunde, die du durch Vorbereitung sparst, bringt dir €${rate} zurück.`,
      optimizationAvailable: 'Strategische Optimierung verfügbar',
      upgradeProAdvice: 'Upgrade auf Pro, um deine persönliche Finanz-Strategie und Spar-Tipps zu sehen.',
    },
    tracker: {
      title: 'Fahrtenbuch',
      subtitle: 'Dokumentiere deine Fahrstunden',
      liveRouteTrace: 'Streckenverlauf (Echtzeit)',
      startPoint: 'Startpunkt',
      endPoint: 'Endpunkt',
      yourDestination: 'Dein Ziel',
      stopSignAhead: 'Stoppschild voraus!',
      sessionUpdated: 'Fahrt aktualisiert',
      sessionSaved: 'Fahrt gespeichert',
      enterDurationError: 'Bitte Dauer eingeben',
      deleteConfirm: 'Möchtest du diese Fahrt wirklich löschen?',
      sessionDeleted: 'Fahrt gelöscht',
      wrongWayAlert: '⛔ Falschfahrer erkannt! Sofort anhalten!',
      pedestrianZone: 'Fußgängerzone',
      privateAccess: 'Privatweg',
      entryForbidden: 'Einfahrt verboten',
      illegalTurn: '⛔ Unzulässiges Abbiegen!',
      rightBeforeLeftAlert: '👉 Rechts vor Links beachten! (Zu schnell)',
      schoolZoneCaution: '🏫 Vorsicht: Schulzone / Spielplatz! (Max 30 empfohlen)',
      destinationFound: 'Ziel gefunden!',
      destinationNotFound: 'Ziel nicht gefunden',
      searchFailed: 'Suche fehlgeschlagen',
      invalidAmountError: 'Bitte geben Sie einen gültigen Betrag ein',
      rateUpdated: 'Stundensatz aktualisiert!',
      gpsDenied: 'Standortzugriff verweigert. Bitte aktiviere GPS in den Einstellungen.',
      gpsError: 'GPS-Fehler. Bitte überprüfe deine Verbindung.',
      rapidAccelAlert: 'Starke Beschleunigung erkannt!',
      aggressiveCorneringAlert: '🏎️ Fliehkraft: Aggressives Kurvenfahren!',
      harshBrakingAlert: 'Starkes Bremsen erkannt!',
      stopSignViolation: 'Stoppschild überfahren!',
      speedingAlert: (limit: number) => `Geschwindigkeitsüberschreitung! (Limit: ${limit})`,
      ecoStopEngine: 'Umweltschutz: Motor abstellen!',
      motionSensorDenied: 'Bewegungssensoren-Zugriff verweigert',
      simulationLooping: 'Simulation wird wiederholt...',
      simulationStarted: 'Fahrt-Timer & Sensoren gestartet!',
      sensorsStarted: 'Sensoren & Tracking gestartet!',
      timerPaused: 'Timer pausiert',
      timerResumed: 'Timer fortgesetzt',
      readyToSave: 'Bereit zum Speichern!',
      mistakeAddedManually: 'Fehler manuell hinzugefügt',
      simulateButton: 'Simulation',
      drivingSchoolRate: 'Fahrschul-Tarif',
      manualLogTitle: 'Fehler manuell erfassen',
      liveTimerTitle: 'Live-Fahrt-Timer',
      simulationMode: 'Simulation',
      confirmSimulate: 'Möchtest du wirklich eine simulierte Fahrt mit Leaflet-Karte und Fehlverhaltens-Daten hinzufügen?',
      safetyScore: 'Sicherheits-Score',
      distance: 'Strecke',
      speed: 'Tempo',
      limit: 'Limit',
      liveTrackingActive: 'Live-Tracking aktiv (Basis-Modus)',
      startLive: 'Tracking starten',
      trackingPro: 'Live-Tracking PRO',
      regularDrive: 'Übungsfahrt',
      conversionOverview: 'Umschreibung Übersicht',
      noMandatorySpecialDrives: 'Keine gesetzlichen Sonderfahrten notwendig',
      conversionNote: 'Bei einer Umschreibung entscheidet der Fahrlehrer über die Anzahl der Übungsstunden.',
      requiredSpecialDrives: 'Vorgeschriebene Sonderfahrten',
      specialDrivesNote: 'Sonderfahrten können erst nach der Grundausbildung begonnen werden.',
      entries: 'Einträge',
      noSessionsTitle: 'Noch keine Fahrten',
      noSessionsMessage: 'Starte dein Live-Tracking oder trage eine vergangene Fahrstunde manuell nach.',
      logFirstSession: 'Erste Fahrt loggen',
      simulated: 'Simuliert',
      safetyBalance: 'Sicherheits-Balance',
      ecoFriendly: 'Umweltbewusst',
      notesLabel: 'NOTIZEN',
      routeMapAvailable: 'Streckenverlauf verfügbar',
      routeMapUpgradeNote: 'Upgraden auf PRO um deine gefahrene Strecke auf der Karte zu sehen.',
      unlockPro: 'PRO freischalten',
      faultAnalysis: 'Fehler-Analyse',
      occurrences: 'Vorkommen',
      faultAnalysisUpgradeNote: 'PRO zeigt dir genau an, wo und wann Fehler passiert sind.',
      seeDetails: 'Details ansehen',
      noCriticalMistakes: 'Keine kritischen Fehler',
      safeDriveMessage: 'Hervorragende Fahrt! Behalte diesen Fokus bei.',
      editSession: 'Bearbeiten',
      deleteSession: 'Löschen',
      clearHistory: 'Verlauf leeren',
      confirmClearHistory: 'Möchtest du wirklich alle Fahrten unwiderruflich löschen?',
      addSessionTitle: 'Fahrt hinzufügen',
      editSessionTitle: 'Fahrt bearbeiten',
      dateLabel: 'Datum',
      driveTypeLabel: 'Art der Fahrt',
      durationLabel: 'Dauer (Minuten)',
      distanceLabel: 'Distanz (km)',
      instructorLabel: 'Fahrlehrer (Name)',
      locationLabel: 'Ort / Strecke',
      locationPlaceholder: 'z.B. Berlin, Mitte',
      notesPlaceholder: 'Was war gut? Was muss geübt werden?',
      destinationPlaceholder: 'Ziel (z.B. Berlin Hbf)',
      radar: {
        reaction: 'Reaktion',
        priority: 'Vorfahrt',
        scan: 'Blick',
        roundabout: 'Kreisel',
        mastered: 'Beherrscht',
        practice: 'Übung',
      },
      mistakes: {
        speeding: 'Geschwindigkeitsüberschreitung',
        harshBraking: 'Starkes Bremsen',
        rapidAcceleration: 'Starke Beschleunigung',
        shoulderCheck: 'Schulterblick vergessen',
        signal: 'Blinker vergessen',
        priority: 'Vorfahrtsfehler',
        stopSign: 'Stoppschild überfahren',
        wrongWay: '⛔ Falschfahrer',
        illegalTurn: '⛔ Unzulässiges Abbiegen',
        roundaboutSignal: '🔄 Kreisverkehr: Blinker',
        curveSpeeding: '⚠️ Unangepasste Geschwind.',
        aggressiveCornering: '🏎️ Aggressives Kurvenfahren',
        rightBeforeLeft: '👉 Rechts vor Links',
        schoolZone: '🏫 Schulzone',
        other: 'Sonstiger Fehler',
        idling: 'Motor laufen gelassen',
      },
      types: {
        normal: 'Übungsfahrt',
        ueberland: 'Überland',
        autobahn: 'Autobahn',
        nacht: 'Nachtfahrt',
      }
    },
    dashboard: {
      examReadiness: 'Prüfungsreife',
      examChance: 'Prüfungschance',
      examScore: 'Prüfungsscore',
      combinedScore: 'Kombination aus Lektionen & Tests',
      unlockPro: 'Alle Funktionen freischalten',
      examSimulation: 'Prüfungssimulation',
      simulationDesc: 'Echte Prüfungsfragen und Zeitdruck',
      drivingHours: 'Fahrstunden',
      chapters: 'Kapitel',
      streak: 'Serie',
      conversionQuickstart: 'Umschreibung Schnellstart',
      germanyFocus: 'Deutschland-Fokus',
      jumpToTraps: 'Springe direkt zu den "deutschen Fallen" in der Prüfung.',
      learningProgress: 'Dein Lernfortschritt',
      changePath: 'Lernpfad ändern',
      accountSettings: 'Kontoeinstellungen',
      continueLearning: 'Weiter lernen',
      viewAll: 'Alle Lektionen',
      proTip: 'Prüfungs-Pro-Tipp',
      tips: {
        conversion: 'Der Schulterblick ist entscheidend. Führe ihn deutlich und sichtbar aus.',
        regular: 'Schulterblick ist der häufigste Fehler! Üben Sie ihn bei jedem Spurwechsel.',
      },
      cloudSyncActive: 'Cloud-Sync aktiv',
      signInForSync: 'Anmelden für Cloud-Sync',
      precisionPrep: 'Präzise Fahrvorbereitung',
      pills: {
        greenArrow: 'Grüner Pfeil',
        shoulderCheck: 'Schulterblick',
        priority: 'Rechts-vor-links',
        instantFail: 'Sofort durchgefallen',
      },
      maneuvers: 'Manöver',
      animations: 'Animationen',
      maneuversDesc: 'Grundfahraufgaben wie Einparken und Wenden.',
      tech: 'Fahrzeugtechnik',
      exam: 'Prüfung',
      techDesc: 'Reifen, Lichter und Kontrollleuchten.',
      reviewPack: 'Fahrlehrer-Review-Paket',
      pdfExport: 'PDF Export',
      reviewDesc: 'Lehrplan und Fortschritt zum Teilen mit dem Fahrlehrer exportieren.',
      practiceCheck: 'Praxis-Check',
      specialDrives: 'Sonderfahrten',
      focusThemes: 'Fokus-Themen',
      mandatoryHours: 'Gesetzliche Pflicht',
      conversionChecks: [
        { title: 'Schulterblick', text: 'Immer ausführen.' },
        { title: 'Vorfahrt', text: 'Rechts-vor-links.' },
        { title: 'Routine', text: 'Ruhige Fahrweise.' },
      ],
      specialDriveTypes: {
        ueberland: 'Überland',
        autobahn: 'Autobahn',
        nacht: 'Nacht',
      },
      hoursSuffix: 'Std',
      manualPath: {
        title: 'Klasse B - Schaltgetriebe',
        subtitle: 'Mit Kupplung & Gangschaltung',
      },
      automaticPath: {
        title: 'Klasse B197 - Automatik',
        subtitle: 'Automatisches Getriebe',
      },
      conversionPath: {
        title: 'Umschreibung',
        subtitleManual: 'Mit Schaltwagen-Prüfung und Fokus auf deutsche Regeln',
        subtitleAuto: 'Mit Automatik-Prüfung und Fokus auf deutsche Regeln',
      }
    },
    licenseSelector: {
      title: 'Willkommen bei DriveDE',
      subtitle: 'Wähle zuerst deinen Führerscheinpfad und dann das Getriebe',
      pathTitle: '1. Lernpfad wählen',
      transmissionTitle: '2. Getriebe wählen',
      standard: {
        title: 'Neuer Führerschein',
        subtitle: 'Normale Fahrschulausbildung',
        description: 'Für Fahrschülerinnen und Fahrschüler, die den deutschen Führerschein neu machen.',
        features: [
          'Vollständiger Lernpfad von Grundlagen bis Prüfungsreife',
          'Manöver, Stadtverkehr, Sonderfahrten und Technikfragen',
          'Schritt-für-Schritt-Anleitungen mit Prüfungsfokus',
          'Fahrstunden-Tracker und Sonderfahrten-Überblick',
        ],
      },
      conversion: {
        title: 'Umschreibung',
        subtitle: 'Ausländischen Führerschein umschreiben',
        description: 'Für Personen mit bestehendem Führerschein aus dem Ausland, die sich auf die praktische Prüfung in Deutschland vorbereiten.',
        features: [
          'Deutschland-Schnellstart mit Prüfungsfallen',
          'Grüner Pfeil, Rechts-vor-links-Ausnahmen & Spielstraße',
          'Prüfer-Kommandos auf Deutsch + Englisch',
          'Sofortiges Nichtbestehen & Schulterblick-Pflichten',
        ],
      },
      manual: {
        title: 'Schaltgetriebe',
        subtitle: 'Kupplung & Gangschaltung',
        description: 'Zeigt Schalt- und Kupplungsinhalte, manuelle Gefahrenbremsung und schaltungsrelevante Tipps.',
      },
      automatic: {
        title: 'Automatik',
        subtitle: 'Ohne Kupplung',
        description: 'Zeigt nur Automatik-Inhalte, automatische Gefahrenbremsung und vereinfachte Fahrzeugbedienung.',
      },
      conversionNote: 'Bei der Umschreibung kann die Prüfung auf Schaltwagen oder Automatik stattfinden. Deshalb musst du auch dort ein Getriebe auswählen.',
      standardNote: 'Bei der normalen Ausbildung steuert die Getriebewahl, welche Lektionen zu Kupplung, Schalten und Gefahrenbremsung sichtbar sind.',
      continue: 'App starten',
      selectPath: 'Pfad auswählen',
      selectTransmission: 'Getriebe auswählen',
      selected: 'Ausgewählt',
      choosePathFirst: 'Bitte zuerst Lernpfad wählen.',
      switchToEnglish: 'Switch to English',
      switchToGerman: 'Auf Deutsch wechseln',
    },
    curriculum: {
      title: 'Lehrplan',
      licensePath: 'Führerscheinpfad',
      changeLicense: 'Führerscheinklasse ändern',
      manual: 'Schaltgetriebe',
      manualDesc: 'Klasse B - Kupplung & Schalten',
      automatic: 'Automatik',
      automaticDesc: 'Klasse B197 - Ohne Kupplung',
      conversionManual: 'Umschreibung · Schaltgetriebe',
      conversionManualDesc: 'Keine Pflichtstunden, aber mit Schaltung',
      conversionAutomatic: 'Umschreibung · Automatik',
      conversionAutomaticDesc: 'Keine Pflichtstunden, nur Automatik-Inhalte',
      umschreibungManual: 'Umschreibung · Schaltgetriebe',
      umschreibungAutomatic: 'Umschreibung · Automatik',
      classBManual: 'Klasse B (Schaltgetriebe)',
      classB197Automatic: 'Klasse B197 (Automatik)',
      manualBadge: 'Schaltung',
      autoBadge: 'Automatik',
      interactiveBadge: 'Interaktiv',
      pathDescUmschreibung: 'Fokussierter Deutschland-Pfad für Umschreibung: deutsche Prüfungsfallen, Vorfahrtsregeln, Schulterblick und Prüfer-Kommandos.',
      pathDescStandard: 'Vollständiger Lernpfad von Grundlagen über Manöver bis zur praktischen Prüfung.',
      noLessonsTitle: 'Keine Lektionen',
      noLessonsMessage: 'Für diesen Lernpfad sind noch keine Lektionen verfügbar. Schau bald wieder vorbei!',
      moneyBackTitle: 'Geld-Zurück-Garantie',
      moneyBackDesc: 'Falls du die Prüfung nicht bestehst',
      quiz: 'Quiz',
      correct: 'Richtig!',
      incorrect: 'Falsch!',
      completeLesson: 'Lektion abschließen',
      interactiveSimulator: 'Interaktiver Simulator',
      masterSituation: 'Meistere die Situation, um die Lektion abzuschließen',
      lessonCompleted: 'Lektion erfolgreich abgeschlossen!',
      solveSimulatorHint: '💡 Löse den Simulator oben, um fortzufahren',
      shoulderScan: 'Praxis-Check: Schulterblick',
      scanningSequence: 'Trainiere die lebenswichtige Blickfolge',
      scanningTrained: 'Blickfolge korrekt trainiert!',
      roundaboutCheck: 'Praxis-Check: Kreisverkehr',
      signalingRules: 'Meistere die Blinkregeln im Kreisel',
      roundaboutCompleted: 'Kreisverkehr erfolgreich beendet!',
      emergencyBrakeCheck: 'Praxis-Check: Gefahrenbremsung',
      reactionTimeTraining: 'Reaktionszeit & Vollbremsung trainieren',
      parkingCheck: 'Praxis-Check: Einparken',
      parallelParkingStep: 'Parallel-Parken Schritt für Schritt',
      vehicleCheck: 'Interaktive Fahrzeugkontrolle',
      techKnowledge: 'Prüfen Sie Ihr technisches Wissen am Fahrzeug',
      examSimulation: 'Full Final Check: Prüfungssimulation',
      expertFeedback: '15-minütige Live-Simulation mit Experten-Feedback',
      animationHide: 'Animation ausblenden',
      animationWatch: '🎬 Animation ansehen',
      step: 'Schritt',
      critical: 'Wichtig!',
      goToQuiz: 'Zum Quiz',
      complete: 'Abschließen',
      nextStep: 'Nächster Schritt',
      allSteps: 'Alle Schritte',
      keyTerms: 'Wichtige Begriffe',
      glossarySub: 'Deutsch und Englisch für Unterricht und Prüfung',
      typicalExaminer: 'Typische Prüferanweisungen',
      examinerSub: 'Originalformulierung verstehen und sicher umsetzen',
      importantSigns: 'Wichtige Verkehrszeichen',
      signsSub: 'Zeichen, die in dieser Situation häufig relevant sind',
      guidedPoints: 'Geführte Lernpunkte',
      guidedPointsSub: 'Prüfungsrelevante Beobachtungs- und Handlungspunkte',
      typicalScenarios: 'Typische Fahrsituationen',
      scenarioSub: 'Schritt-für-Schritt für knifflige Praxis-Situationen',
      trafficLights: 'Ampel',
      laneShape: 'Spur & Straßenform',
      specialRules: 'Sonderregeln',
      scenarioStep: 'Schritt',
      commonMistakes: 'Häufige Fehler in dieser Situation',
      instructorTips: 'Tipps vom Fahrlehrer',
      markAsLearned: 'Als gelernt markieren',
    },
    legal: {
      privacy: 'Datenschutzerklärung',
      terms: 'AGB / Nutzungsbedingungen',
      gdpr: 'DSGVO & Betroffenenrechte',
      impressum: 'Impressum',
      disclaimer: 'Haftungsausschluss',
      sections: {
        controller: '1. Verantwortlicher',
        processedData: '2. Welche Daten verarbeitet werden',
        purpose: '3. Zweck der Verarbeitung',
        storage: '4. Speicherung und Empfänger',
        legalBases: '5. Rechtsgrundlagen',
        scope: '1. Geltungsbereich',
        noSubstitute: '2. Kein Ersatz für Fahrlehrer oder amtliche Quellen',
        useOfContent: '3. Nutzung der Inhalte',
        availability: '4. Verfügbarkeit und Änderungen',
        limitation: '5. Haftungsbeschränkung',
        yourRights: 'Deine Rechte nach DSGVO',
        howToExercise: 'So kannst du deine Rechte ausüben',
        complaint: 'Beschwerderecht',
        provider: 'Anbieterkennzeichnung',
        contact: 'Kontakt',
        notice: 'Hinweis',
        safety: 'Wichtiger Sicherheitshinweis',
        noGuarantee: 'Keine Garantie für Bestehen oder Vollständigkeit',
        sources: 'Maßgebliche Quellen',
      },
      placeholders: {
        controller: 'Bitte ersetze vor Launch diese Platzhalterdaten durch deine echten Daten: DriveDE, Musterstraße 1, 10115 Berlin, E-Mail: privacy@drivede.app.',
        imprint: 'Bitte ersetze diese Platzhalterangaben vor Veröffentlichung vollständig durch die echten Angaben des Betreibers. Beispiel: DriveDE GmbH, Musterstraße 1, 10115 Berlin, Deutschland.',
        notice: 'Je nach Rechtsform und Tätigkeit können weitere Pflichtangaben erforderlich sein, z. B. Handelsregister, Umsatzsteuer-ID, vertretungsberechtigte Person oder Berufsangaben. Bitte rechtlich prüfen lassen.',
        launchReady: 'Diese Inhalte sind eine Startvorlage für den Launch. Vor Veröffentlichung bitte alle Platzhalter, Unternehmensdaten und rechtlichen Details final prüfen und anpassen.',
      },
      hub: {
        title: 'Rechtliches & Datenschutz',
        desc: 'Diese Seite bündelt die wichtigsten rechtlichen Informationen, die für den Beta- oder Launch-Betrieb in Deutschland und der EU benötigt werden. Bitte ersetze vor der Veröffentlichung alle Platzhalter durch deine echten Kontakt- und Unternehmensdaten.',
        items: {
          privacy: 'Wie Daten verarbeitet, gespeichert und geschützt werden',
          terms: 'Regeln für Nutzung, Haftung und Inhalte',
          gdpr: 'Auskunfts-, Lösch- und Exportrechte',
          impressum: 'Anbieterkennzeichnung und rechtliche Hinweise nach deutschem Recht',
          disclaimer: 'Wichtige Nutzungs- und Sicherheitshinweise zur App',
        }
      },
      legalContent: {
        privacy: {
          processedData: [
            'App-Einstellungen wie Sprache, Dark Mode, Lernpfad und Getriebetyp',
            'Lokaler Lernfortschritt, absolvierte Lektionen, Quizstände und Fahrtenbuchdaten',
            'Optionale Kontakt- oder Feedbackdaten, wenn Nutzer aktiv eine Anfrage senden'
          ],
          purpose: 'Die Daten werden zur Bereitstellung der App-Funktionen, zur Speicherung des Lernfortschritts, zur Verbesserung der Nutzererfahrung sowie – falls später aktiviert – zur Synchronisierung über mehrere Geräte verwendet.',
          storage: 'In der aktuellen Beta-Version werden die meisten Daten lokal auf dem Gerät gespeichert. Falls später Cloud-Dienste, Analytik oder Zahlungsdienste eingesetzt werden, müssen diese hier einzeln benannt werden.',
          legalBases: [
            'Art. 6 Abs. 1 lit. b DSGVO – Vertragserfüllung bzw. Bereitstellung der App',
            'Art. 6 Abs. 1 lit. f DSGVO – berechtigte Interessen an sicherem und stabilem App-Betrieb',
            'Art. 6 Abs. 1 lit. a DSGVO – Einwilligung, falls optionale Analytik oder Marketing aktiviert werden'
          ]
        },
        terms: {
          scope: 'Diese Nutzungsbedingungen regeln die Nutzung der App DriveDE. Die App dient der Unterstützung bei der Vorbereitung auf praktische Fahrstunden und Fahrprüfungen in Deutschland.',
          noSubstitute: 'Die App ersetzt keine Fahrschule, keinen Fahrlehrer, keine amtliche Rechtsberatung und keine offiziellen Informationen von Behörden, TÜV oder DEKRA. Maßgeblich sind stets die geltenden Gesetze, Verordnungen und die konkrete Anweisung des Fahrlehrers oder Prüfers.',
          useOfContent: 'Die Inhalte dürfen ausschließlich für den persönlichen, nicht übertragbaren Lerngebrauch genutzt werden. Eine gewerbliche Weitergabe, systematische Vervielfältigung oder Weiterveröffentlichung ist ohne schriftliche Zustimmung unzulässig.',
          availability: 'Die App kann fortlaufend angepasst, verbessert oder in einzelnen Funktionen eingeschränkt werden. Es besteht kein Anspruch auf dauerhafte Verfügbarkeit einzelner Inhalte oder Funktionen.',
          limitation: 'Für leichte Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten. Für Schäden aus unsachgemäßer Anwendung der Inhalte im realen Straßenverkehr übernehmen wir keine Haftung, soweit gesetzlich zulässig.'
        },
        gdpr: {
          yourRights: [
            'Auskunft über verarbeitete personenbezogene Daten',
            'Berichtigung unrichtiger Daten',
            'Löschung personenbezogener Daten',
            'Einschränkung der Verarbeitung',
            'Datenübertragbarkeit',
            'Widerspruch gegen bestimmte Verarbeitungen',
            'Widerruf einer Einwilligung mit Wirkung für die Zukunft'
          ],
          howToExercise: 'Sende eine Anfrage an privacy@drivede.app. Vor Launch müssen hier die echten Kontaktdaten hinterlegt werden. In der aktuellen lokalen App-Version können Nutzer viele Daten direkt durch Zurücksetzen der App oder Löschen der Browser-/Gerätespeicherung entfernen.',
          complaint: 'Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren, wenn du der Ansicht bist, dass die Verarbeitung deiner Daten gegen die DSGVO verstößt.'
        },
        disclaimer: {
          safety: 'Die App dient ausschließlich der Lernunterstützung. Inhalte dürfen niemals während des aktiven Führens eines Fahrzeugs verwendet oder gelesen werden. Nutze die App nur vor oder nach der Fahrt oder als Beifahrer.',
          noGuarantee: 'DriveDE gibt keine Garantie für das Bestehen einer praktischen Prüfung. Prüfungsanforderungen können regional, fahrzeugbezogen oder prüferabhängig variieren. Inhalte werden sorgfältig erstellt, können jedoch trotz Prüfung Fehler oder Vereinfachungen enthalten.',
          sources: 'Im Zweifel gelten immer die aktuelle Straßenverkehrs-Ordnung (StVO), Fahrlehrer-Anweisungen, offizielle Prüfkriterien sowie die konkrete Verkehrslage vor Ort.'
        }
      }
    },
    maneuvers: {
      title: 'Grundfahraufgaben',
      subtitle: 'Schritt-für-Schritt Anleitungen für die Prüfung',
      noManeuversTitle: 'Keine Manöver',
      noManeuversMessage: 'Für diesen Lernpfad sind keine speziellen Grundfahraufgaben erforderlich.',
      steps: 'Schritte',
      start: 'Starten',
      importantTips: 'Wichtige Hinweise',
      check360: 'Rundum-Blick + Schulterblick!',
      check360Desc: 'Vor jedem Rückwärtsweg Rundum-Blick, bei Spurwechsel und Richtungswechsel klarer Schulterblick',
      driveSlowly: 'Langsam fahren',
      driveSlowlyDesc: 'Bei Manövern gilt: Geschwindigkeit = Kontrolle',
      correctionsAllowed: 'Korrigieren erlaubt',
      correctionsAllowedDesc: 'Rangieren ist bei der Prüfung kein Problem',
      checklistTitle: 'Prüfungs-Checkliste',
      checklist: [
        '✓ Beobachten → Blinken → Schulterblick → Manöver',
        '✓ Kupplung am Schleifpunkt halten',
        '✓ Orientierungspunkte nutzen',
        '✓ Ruhe bewahren, Zeit lassen',
      ],
      items: {
        'maneuver-1': { title: 'Längsparken (Parallel)' },
        'maneuver-2': { title: 'Querparken (Rückwärts)' },
        'maneuver-3': { title: 'Wenden in 3 Zügen' },
        'maneuver-4': { title: 'Gefahrenbremsung' }
      },
      animatedGuides: 'Animierte Anleitungen',
      parking: 'Einparken',
      reverse: 'Rückwärts',
      threePoint: 'Wenden',
      emergency: 'Notbremse',
      roundabout: 'Kreisverkehr',
      highway: 'Autobahn',
      animationAria: (label: string, isOpen: boolean) => `Animation für ${label} ${isOpen ? 'schließen' : 'öffnen'}`,
      interactive: {
        parking: {
          title: 'Parallel-Parken Simulator',
          complete: 'Lektion beenden',
          startEngine: 'Anfahren',
          stop: 'STOPP',
          turnWheel: 'Einschlagen ↷',
          counterSteer: 'Gegenlenken ↶',
          hintStart: 'Fahre vorwärts, bis du neben dem blauen Auto stehst.',
          hintAlign: 'Klicke "STOPP", wenn deine Hinterachse auf Höhe des Hecks vom blauen Auto ist.',
          hintSteerIn: 'Schlage das Lenkrad voll nach RECHTS ein.',
          hintBackIn: 'Fahre rückwärts, bis du das hintere Auto im linken Spiegel siehst.',
          hintSteerOut: 'Schlage das Lenkrad nun voll nach LINKS ein.',
          hintFinal: 'Perfekt geparkt! Der Abstand zum Bordstein passt.',
          note: 'Wichtig: In der Prüfung musst du beim Rückwärtsfahren immer einen Rundumblick machen. Im Simulator konzentrieren wir uns auf die Orientierungspunkte.',
        },
        simulator: {
          checkSurroundings: 'Umfeld beobachten (360° Check)!',
          steerAndReverse: 'Einschlagen & Rückwärts!',
          counterSteer: 'Gegenlenken & Ausrichten!',
          shoulderCheckRight: 'Schulterblick RECHTS!',
          shoulderCheckLeft: 'Schulterblick LINKS!',
          fullCheckAndSignalRight: 'Rundum-Blick & RECHTS blinken!',
          dangerEmergencyBrake: '🚨 GEFAHR! VOLLBREMSUNG! 🚨',
          checkBeforeDrive: 'Umfeld prüfen!',
          signalRightAndShoulder: 'Blinker RECHTS & Schulterblick!',
          signalLeftAndAccelerate: 'Blinker LINKS & Gas geben!',
          mirrorAndShoulderLeft: 'Spiegel- & Schulterblick links!',
        },
        priority: {
          title: 'Mini-Simulator: Wer darf zuerst?',
          instructions: 'Klicke auf die Fahrzeuge in der richtigen Reihenfolge.',
          error: (label: string) => `Falsch! Beachte die "Rechts vor Links" Regel. Das ${label} hat Vorrang.`,
          successTitle: 'Super!',
          successMessage: 'Du hast die Vorfahrtsregel korrekt angewendet.',
          continue: 'Lektion fortsetzen',
          didYouKnow: 'Wusstest du?',
          fact: 'In Deutschland gilt an Kreuzungen ohne Schilder immer "Rechts vor Links". Wer von rechts kommt, darf zuerst fahren.',
          blueCar: 'Blaues Auto (von Rechts)',
          redCar: 'Rotes Auto (von Unten)',
        },
        techCheck: {
          title: 'Fahrzeugtechnik-Check',
          found: 'gefunden',
          instruction: 'Klicke auf die Markierungen im Motorraum, um mehr zu erfahren.',
          passed: 'Technik-Check bestanden!',
          hotspots: {
            oil: { name: 'Ölmessstab', desc: 'Zum Prüfen des Motorölstands. Der Stand muss zwischen MIN und MAX liegen.' },
            coolant: { name: 'Kühlwasser', desc: 'Niemals bei heißem Motor öffnen! Verbrennungsgefahr.' },
            washer: { name: 'Scheibenwischwasser', desc: 'Blauer Deckel. Wichtig für gute Sicht, besonders im Winter mit Frostschutz.' },
            brake: { name: 'Bremsflüssigkeit', desc: 'Wenn der Stand sinkt, sofort in die Werkstatt. Sicherheitssystem!' },
            battery: { name: 'Batterie', desc: 'Prüfen auf festen Sitz der Pole und Sauberkeit.' }
          }
        },
        roundabout: {
          title: 'Kreisverkehr-Meister',
          entry: 'Einfahren',
          inside: 'Im Kreisel',
          exit: 'Ausfahren',
          success: 'Super!',
          mastered: 'Du beherrschst den Kreisverkehr.',
          signalRight: 'Blinker Rechts',
          driveExit: 'Fahren / Ausfahren',
          ruleTitle: 'Merksatz:',
          ruleText: 'Rein ohne blinken, raus mit blinken! Wer im Kreis ist, hat Vorfahrt.',
          errorEntry: 'Falsch! Beim Einfahren in den Kreisverkehr darf NICHT geblinkt werden.',
          errorExit: 'Warte! Du musst blinken, um anzuzeigen, dass du den Kreisverkehr am nächsten Ausgang verlässt.',
        },
        emergencyBrake: {
          title: 'Gefahrenbremsung Training',
          stop: 'HALT!',
          success: 'Perfekt gebremst!',
          tooSlow: 'Zu langsam!',
          reactFaster: 'Du musst schneller reagieren.',
          brakeEarly: 'Nicht zu früh bremsen!',
          tryAgain: 'Nochmal versuchen',
          startTest: 'Test Starten',
          brake: 'BREMSEN',
          examTip: 'Tipp für die Prüfung:',
          standard: 'Reaktionszeit unter 700ms ist Prüfungs-Standard.',
          ready: 'Bereit machen... Drücke auf BREMSEN sobald du den Befehl siehst!',
          tipText: 'In der Prüfung musst du "schlagartig" bremsen. Das ABS muss regeln, und das Auto muss wirklich quietschen/vibrieren!',
        },
        mirrorCheck: {
          title: 'Blickführung & Absicherung',
          interior: 'Innenspiegel',
          shoulder: 'Schulterblick',
          examReady: 'Prüfungsreif!',
          ruleTitle: 'Der 3-S-Blick:',
          error: (label: string) => `Falsch! Die richtige Reihenfolge ist entscheidend. Als nächstes: ${label}`,
          laneChange: (dir: string) => `Spurwechsel/Abbiegen nach ${dir === 'left' ? 'Links' : 'Rechts'}`,
          successText: 'Du hast die 3-S-Blick-Routine perfekt im Griff. So bestehst du jeden Spurwechsel.',
          indicator: 'Blinker setzen',
          ruleText: 'Zuerst die Übersicht (Innenspiegel), dann die Absicherung (Außenspiegel), dann die Absicht anzeigen (Blinker) und unmittelbar vor dem Wechsel der Schulterblick für den Toten Winkel.',
        },
      },
    },
    exam: {
          title: 'Bist du bereit für deine Prüfung?',
          desc: 'In dieser 15-minütigen Simulation musst du schnell und sicher auf Prüfungsfragen und Verkehrssituationen reagieren.',
          start: 'Simulation starten',
          passed: 'Prüfung Bestanden!',
          failed: 'Leider nicht bestanden',
          excellent: 'Hervorragend! Du bist bereit für die echte Prüfung.',
          practice: 'Übe die kritischen Situationen noch einmal.',
          finish: 'Abschließen',
          scenarios: [
            {
              id: 'start',
              situation: 'Der Prüfer setzt sich ins Auto. "Guten Tag. Bitte bereiten Sie sich für die Abfahrt vor."',
              options: [
                { id: 'o1', text: 'Motor starten und sofort losfahren.', isCorrect: false, feedback: 'Fehler! Erst Spiegel und Sitz einstellen, dann anschnallen.' },
                { id: 'o2', text: 'Sitz/Spiegel prüfen, Anschnallen, Motor starten.', isCorrect: true, feedback: 'Richtig. Sicherheit geht vor.' }
              ]
            },
            {
              id: 'right-of-way',
              situation: 'Sie kommen an eine Kreuzung ohne Schilder (Rechts vor Links). Von rechts nähert sich ein Fahrzeug.',
              options: [
                { id: 'o1', text: 'Anhalten und das andere Fahrzeug vorlassen.', isCorrect: true, feedback: 'Korrekt. Rechts vor Links beachtet.' },
                { id: 'o2', text: 'Zügig weiterfahren, da man selbst schneller ist.', isCorrect: false, feedback: 'Durchgefallen! Vorfahrt missachtet.' }
              ]
            },
            {
              id: 'tempo-30',
              situation: 'Sie biegen in eine Straße ein und sehen das Schild "Zone 30". Ihr Tacho zeigt 45 km/h.',
              options: [
                { id: 'o1', text: 'Sofort auf 30 km/h abbremsen.', isCorrect: true, feedback: 'Richtig. In Zonen muss das Limit exakt eingehalten werden.' },
                { id: 'o2', text: 'Ausrollen lassen, bis man 35 km/h erreicht.', isCorrect: false, feedback: 'Fehler! Zu schnell in der 30er Zone.' }
              ]
            },
            {
              id: 'school-bus',
              situation: 'Ein Schulbus hält vor Ihnen mit eingeschalteter Warnblinkanlage.',
              options: [
                { id: 'o1', text: 'Nur mit Schrittgeschwindigkeit (4-7 km/h) vorbeifahren, falls gefahrlos möglich.', isCorrect: true, feedback: 'Korrekt. Besondere Vorsicht bei Schulbussen!' },
                { id: 'o2', text: 'Mit normaler Stadtgeschwindigkeit (50 km/h) überholen.', isCorrect: false, feedback: 'Durchgefallen! Lebensgefährliche Situation für Kindern.' }
              ]
            },
            {
              id: 'zebra-crossing',
              situation: 'Ein Fußgänger nähert sich erkennbar einem Zebrastreifen.',
              options: [
                { id: 'o1', text: 'Anhalten und den Fußgänger überqueren lassen.', isCorrect: true, feedback: 'Richtig. Fußgänger haben hier Vorrang.' },
                { id: 'o2', text: 'Kurz hupen und zügig weiterfahren.', isCorrect: false, feedback: 'Durchgefallen! Vorrang missachtet.' }
              ]
            },
            {
              id: 'cyclist-overtake',
              situation: 'Sie möchten einen Radfahrer innerhalb der Ortschaft überholen.',
              options: [
                { id: 'o1', text: 'Mindestens 1,5 Meter Seitenabstand einhalten.', isCorrect: true, feedback: 'Sehr gut. Abstand ist gesetzlich vorgeschrieben.' },
                { id: 'o2', text: 'Eng vorbeifahren, damit der Gegenverkehr nicht behindert wird.', isCorrect: false, feedback: 'Durchgefallen! Gefährdung des Radfahrers.' }
              ]
            },
            {
              id: 'left-turn',
              situation: 'Sie wollen links abbiegen. Es kommt Gegenverkehr geradeaus entgegen.',
              options: [
                { id: 'o1', text: 'Den Gegenverkehr erst durchfahren lassen.', isCorrect: true, feedback: 'Korrekt. Linksabbieger müssen warten.' },
                { id: 'o2', text: 'Schnell vor dem Gegenverkehr abbiegen.', isCorrect: false, feedback: 'Durchgefallen! Vorfahrt erzwingen ist verboten.' }
              ]
            },
            {
              id: 'stop-sign',
              situation: 'Sie kommen an ein STOPP-Schild mit einer Haltelinie.',
              options: [
                { id: 'o1', text: 'An der Haltelinie komplett zum Stillstand kommen (3 Sek.).', isCorrect: true, feedback: 'Richtig. "Rollen" gilt als durchgefallen.' },
                { id: 'o2', text: 'Langsam ranrollen und weiterfahren, wenn frei ist.', isCorrect: false, feedback: 'Durchgefallen! Stopp-Pflicht missachtet.' }
              ]
            },
            {
              id: 'autobahn-merge',
              situation: 'Sie befinden sich auf dem Beschleunigungsstreifen der Autobahn.',
              options: [
                { id: 'o1', text: 'Kräftig beschleunigen und mit passendem Tempo einfädeln.', isCorrect: true, feedback: 'Korrekt. Zügiges Auffahren ist sicherer.' },
                { id: 'o2', text: 'Am Anfang des Streifens anhalten und auf eine Lücke warten.', isCorrect: false, feedback: 'Gefährlich! Das führt oft zu Auffahrunfällen.' }
              ]
            },
            {
              id: 'finish-park',
              situation: 'Der Prüfer sagt: "Suchen Sie sich eine Parklücke und stellen Sie das Fahrzeug ab."',
              options: [
                { id: 'o1', text: 'Lücke suchen, Blinken, Sichern, Einparken, Motor aus, Sichern.', isCorrect: true, feedback: 'Perfekt. Herzlichen Glückwunsch, Sie haben bestanden!' },
                { id: 'o2', text: 'Einfach auf den Gehweg stellen und rausspringen.', isCorrect: false, feedback: 'Durchgefallen auf den letzten Metern!' }
              ]
            }
          ],
    },
    instructor: {
          title: 'Fahrlehrer-Review',
          print: 'Drucken',
          downloadPdf: 'PDF laden',
          generating: 'Wird erstellt…',
          packTitle: 'Fahrlehrer-Review-Paket',
          packSubtitle: 'DriveDE – Unterlagen zur fachlichen Prüfung',
          packDesc: 'Diese Zusammenstellung bündelt genau die Unterlagen, die ein deutscher Fahrlehrer typischerweise für eine fachliche Beurteilung braucht: Lehrplan, Beispiellektionen, Manöver-Anleitungen, Bewertungsraster, UX-Beschreibung und Quizfragen.',
          activeSelection: 'Aktive Auswahl',
          mistakeReview: 'Meine Fehler-Korrektur',
          mistakesWaiting: (count: number) => `${count} Szenarien warten auf Wiederholung.`,
          markAsLearned: 'Als gelernt markieren',
          situation: 'Situation:',
          correctAnswer: 'Richtige Antwort:',
          shareTitle: 'Was Sie Ihrem Fahrlehrer teilen können',
          shareDesc: 'Direkt aus der App druckbar oder als PDF speicherbar.',
          shareItems: [
            '1. Dieses Review-Paket als PDF exportieren',
            '2. Den App-Link plus 3–5 Screenshots mitschicken',
            '3. Fahrlehrer gezielt um StVO-, Didaktik- und Prüfungsfeedback bitten',
            '4. Korrekturen nach Priorität 1 → 2 → 3 einarbeiten',
          ],
          section1Title: '1. Modulübersicht / Table of Contents',
          section1Desc: 'Zur Bewertung der didaktischen Reihenfolge.',
          section2Title: '2. Volltext von 3 Beispiellektionen',
          section2Desc: 'Zur Prüfung von StVO-Genauigkeit, Tiefe und Struktur.',
          section3Title: '3. Manöver-Anleitungen & Referenzpunkte',
          section3Desc: 'Zur fachlichen Prüfung von Reihenfolge, Blicktechnik und Referenzpunkten.',
          section4Title: '4. Bewertungsraster / Review Rubric',
          section4Desc: 'Zur Einordnung gegenüber realen TÜV/DEKRA-Kriterien.',
          section5Title: '5. Screenshots / Screen Descriptions',
          section5Desc: 'Zur Bewertung von UX, Klarheit und pädagogischer Führung.',
          section6Title: '6. Quiz- / Testfragen',
          section6Desc: 'Zur Prüfung juristischer und technischer Korrektheit.',
          pdfTitle: 'DriveDE – Fahrlehrer-Review-Paket',
          pdfActiveSelection: 'Aktive Auswahl',
          pdfIntro: 'Diese PDF bündelt Lehrplan, Beispiellektionen, Manöver-Anleitungen, Bewertungsraster, UX-Beschreibung und Quizfragen für die fachliche Prüfung durch einen deutschen Fahrlehrer.',
          pdfSection1: '1. Modulübersicht / Table of Contents',
          pdfSection2: '2. Volltext von 3 Beispiellektionen',
          pdfSection3: '3. Manöver-Anleitungen & Referenzpunkte',
          pdfSection4: '4. Bewertungsraster / Review Rubric',
          pdfSection5: '5. Screen Descriptions',
          pdfSection6: '6. Quiz- / Testfragen',
          pdfCorrectAnswer: 'Richtige Antwort',
          sampleLesson: 'Beispiellektion',
          relevantSigns: 'Relevante Zeichen / Visuals',
          guidedPoints: 'Geführte Lernpunkte',
          stepByStep: 'Schritt-für-Schritt-Anleitung',
          examScenarios: 'Prüfungsszenarien',
          instructorNotes: 'Dozenten-/Prüfungshinweise',
          whatToReview: 'Darauf achten:',
          typicalRisk: 'Typisches Risiko:',
          printError: 'Druckansicht konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
          popupError: 'Das Druckfenster konnte nicht geöffnet werden. Bitte erlauben Sie Pop-ups für diese Seite.',
          pdfError: 'PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
          licenseTypes: {
            'umschreibung-manual': 'Umschreibung · Schaltgetriebe',
            'umschreibung-automatic': 'Umschreibung · Automatik',
            'manual': 'Neuer Führerschein · Schaltgetriebe',
            'automatic': 'Neuer Führerschein · Automatik'
          },
          paywall: {
            title: 'DriveDE Pro',
            badge: 'PREMIUM FREISCHALTEN',
            subtitle: 'Deine Abkürzung zum Führerschein',
            features: [
              'GPS Live-Tracking & Fehler-Analyse',
              'AI Fahr-Coach & Individuelle Tipps',
              'Alle Video-Lektionen & 3D-Szenarien',
              'Exklusives PDF Fahrlehrer-Review',
              'Priorisierter Cloud-Sync & Support'
            ],
            cta: 'Jetzt Pro freischalten',
            cancel: 'Vielleicht später',
            secure: 'Sicher via Stripe',
            trust: 'TÜV / DEKRA Richtlinien 2026',
            moneyBack: 'Geld-Zurück-Garantie',
            moneyBackDesc: 'Falls du die Prüfung nicht bestehst',
            recommended: 'EMPFOHLEN',
            tiers: {
              '30-days': {
                label: 'Starter',
                description: 'Perfekt zum Ausprobieren',
                period: 'für 30 Tage'
              },
              '90-days': {
                label: 'Meistgewählt',
                description: 'Beste Prüfungsvorbereitung',
                period: '90 Tage Fokus'
              },
              'lifetime': {
                label: 'Rundum Sorglos',
                description: 'Für immer dein Begleiter',
                period: 'Lebenslanger Zugriff'
              }
            }
          },
          drivingInsights: {
            title: 'Wöchentliche Analyse',
            activity: 'Wochen-Aktivität',
            last7Days: 'Letzte 7 Tage',
            unlockInsights: 'Werte freischalten',
            focusAreas: 'Fokus-Themen',
            basedOnHistory: 'Basierend auf deinen Fahrern',
            reviewLesson: 'Lektion wiederholen',
            noRecurringFaults: 'Perfekt! Keine Fehler-Häufung.',
            aiAnalysisPro: 'Die KI-Fehleranalyse ist für Pro-Mitglieder verfügbar.',
            unlockPro: 'PRO FREISCHALTEN',
            ecoCoachTitle: 'Eco-Coach Insight',
            ecoCoachIdling: 'Du hast in dieser Woche {count}x den Motor unnötig laufen lassen. Das kostet ca. 1.2L Kraftstoff pro Stunde und ist ein Prüfungsfehler.',
            ecoCoachLearn: 'Energiesparende Fahrweise lernen',
            mistakeLabels: {
              'speeding': 'Geschwindigkeit',
              'shoulder_check': 'Schulterblick',
              'priority': 'Vorfahrt',
              'right_before_left': 'Rechts vor Links',
              'idling': 'Umweltschutz',
              'roundabout_signal': 'Kreisverkehr',
              'harsh_braking': 'Harte Bremsung',
              'harsh_cornering': 'Kurvenverhalten',
              'school_zone': 'Schulzone',
              'school_zone_speeding': 'Schulzone (+km/h)',
              'curve_speeding': 'Geschw. in Kurve',
              'aggressive_cornering': 'G-Kräfte Kurve',
              'wrong_way': 'Falschfahrer',
              'illegal_turn': 'Abbiegefehler',
              'pedestrian_safety': 'Fußgängerschutz'
            }
          },
          rubricItems: [
            {
              area: 'Blickführung & Schulterblick',
              check: 'Spiegelarbeit, Schulterblick beim Anfahren, Spurwechsel, Abbiegen und Rückwärtsfahren klar sichtbar.',
              risk: 'Fehlender Schulterblick ist einer der häufigsten schweren Prüfungsfehler.'
            },
            {
              area: 'Vorfahrt & Regelverständnis',
              check: 'Rechts-vor-links, Kreisverkehr, Zebrastreifen, Ampeln, abknickende Vorfahrt, Fußgänger/Cyclists.',
              risk: 'Unklare Vorfahrtslage oder falsches Verhalten gegenüber Schutzbedürftigen.'
            },
            {
              area: 'Fahrstreifen & Positionierung',
              check: 'Sauberes Einordnen, korrektes Rechtsfahrgebot, Abbiegespuren, Abstand zum Bordstein beim Parken.',
              risk: 'Falsche Spurwahl, zu spätes Einordnen oder unsaubere Fahrzeugposition.'
            },
            {
              area: 'Geschwindigkeit & Fahrzeugkontrolle',
              check: 'Angepasste Geschwindigkeit, ruhiges Anfahren, Kupplung/Gangwahl bei Schaltwagen, präzises Lenken und Bremsen.',
              risk: 'Hektik, Abwürgen, unnötig harte Bremsungen oder zu schnelles Heranfahren an Gefahrstellen.'
            },
            {
              area: 'Grundfahraufgaben',
              check: 'Parallelparken, Rückwärts einparken, Wenden, Gefahrenbremsung mit korrekten Beobachtungs- und Pedalabläufen.',
              risk: 'Fehlende Beobachtung, falsche Referenzpunkte, unsaubere Endposition, falsche Gefahrenbremsung.'
            },
            {
              area: 'Technikfragen & Abfahrtskontrolle',
              check: 'Ölstand, Reifenprofil, Beleuchtung, Warnleuchten, Warndreieck, Warnweste, Erste-Hilfe-Set.',
              risk: 'Unsichere oder auswendig gelernte Antworten ohne praktische Zeigekompetenz.'
            }
          ],
          screenDescriptions: [
            {
              name: 'Dashboard / Startseite',
              text: 'Zeigt Lernfortschritt, Fahrstunden, Sonderfahrten bzw. Umschreibungs-Hinweise, Pro-Funktionen und Schnellzugriffe auf prüfungsrelevante Inhalte.'
            },
            {
              name: 'Kapitelübersicht',
              text: 'Listet alle Kapitel und Lektionen in didaktischer Reihenfolge, inklusive Schalt/Automatik-Filter, Prüfungs-Badges und Fortschritt je Kapitel.'
            },
            {
              name: 'Lektionsdetail',
              text: 'Kombiniert geführte Lernpunkte, typische Prüfungsszenarien, Verkehrszeichen, Schritt-für-Schritt-Anleitungen, typische Fehler und Quizfragen.'
            },
            {
              name: 'Manöver-Schnellansicht',
              text: 'Bietet schnelle Wiederholung von Einparken, Wenden, Gefahrenbremsung und animierten Visualisierungen.'
            },
            {
              name: 'Fahrtenbuch / Tracker',
              text: 'Erfasst Normalfahrten und Sonderfahrten, zeigt Soll/Ist-Stände und behandelt Umschreibung ohne gesetzliche Pflichtstunden separat.'
            }
          ],
    },
    curriculumData: {
            lessons: {
              'basics-0': {
                title: 'Umschreibung: Schnellstart Deutschland',
                description: 'Der kompakte Einstieg für Umschreiber: deutsche Prüfungslogik, Schulterblick, Vorfahrt, Prüferanweisungen und typische Fallen.'
              },
              'basics-1': {
                title: 'Sitzposition & Spiegel',
                description: 'Die richtige Einstellung für sicheres Fahren',
                tips: [
                  { id: 'seat-tip1', title: 'Alles im Griff', content: 'Prüfen Sie vor Fahrtbeginn, ob Sie die Kupplung ganz durchtreten können, ohne das Bein ganz durchzustrecken.', type: 'info' }
                ]
              },
              'basics-1b': {
                title: 'Schulterblick: Pflichtsituationen',
                description: 'Die wichtigste Beobachtungsroutine für Anfahren, Abbiegen, Spurwechsel, Vorbeifahren und Parken.',
                tips: [
                  { id: 'sb-tip1', title: 'Sichtbarkeit zählt', content: 'Der Schulterblick muss für den Prüfer deutlich als Kopfbewegung erkennbar sein.', type: 'warning' }
                ]
              },
              'basics-1a': {
                title: 'Fahrzeugcheck & Technikfragen',
                description: 'Motorraum, Reifen, Warnleuchten, Beleuchtung und typische Prüfungsfragen',
                scenarioSectionTitle: 'Typische Prüfungsfragen & technische Situationen',
                scenarioSectionSubtitle: 'Schritt-für-Schritt für häufige Technikfragen in der praktischen Prüfung'
              },
              'basics-2': {
                title: 'Anfahren & Anhalten (Schaltgetriebe)',
                description: 'Motor starten, Kupplung bedienen, losfahren und sicher anhalten',
                tips: [
                  { id: 'start-tip1', title: 'Gefühlvoll einkuppeln', content: 'Suchen Sie den Schleifpunkt und geben Sie dabei nur ganz leicht Gas.', type: 'info' }
                ]
              },
              'basics-2a': {
                title: 'Anfahren & Anhalten (Automatik)',
                description: 'Motor starten, Wählhebel bedienen, losfahren und sicher anhalten',
                tips: [
                  { id: 'start-auto-tip1', title: 'Wählhebelstellungen', content: 'P = Parken, R = Rückwärts, N = Neutral, D = Drive (Vorwärts). Immer mit Fuß auf der Bremse schalten!', type: 'info' },
                  { id: 'start-auto-tip2', title: 'Kriechfunktion', content: 'Automatik-Fahrzeuge rollen in D oder R langsam ohne Gas (Kriechfunktion). Bremse halten beim Stehen!', type: 'warning' }
                ]
              },
              'basics-3': {
                title: 'Schalten & Kupplungstechnik',
                description: 'Gangwechsel, Kupplungstechnik und Drehzahlgefühl',
                tips: [
                  { id: 'shift-tip1', title: 'Wann schalten?', content: 'Hochschalten bei ~2000-2500 U/min (Diesel) oder ~2500-3000 U/min (Benzin). Runterschalten unter ~1500 U/min.', type: 'info' },
                  { id: 'shift-tip2', title: 'Schaltfehler vermeiden', content: 'Kupplung immer ganz durchtreten! Nie mit der Kupplung "schleifen" lassen. Das verschleißt die Kupplung.', type: 'warning' }
                ]
              },
              'basics-3a': {
                title: 'Fahrmodi & Tiptronic',
                description: 'Automatik-Modi, Sport-Modus und manuelles Eingreifen',
                tips: [
                  { id: 'mode-tip1', title: 'Fahrmodi verstehen', content: 'D = Normal, S = Sport (höhere Drehzahlen), manche Autos haben Eco-Modus für Kraftstoffsparen.', type: 'info' }
                ]
              },
              'basics-4': {
                title: 'Lenkradführung',
                description: 'Richtige Handhaltung und Lenktechnik',
                tips: [
                  { id: 'steer-tip1', title: 'Viertel vor Drei Stellung', content: 'Halten Sie das Lenkrad immer mit beiden Händen in der 9-und-3-Uhr-Stellung für maximale Kontrolle.', type: 'info' }
                ]
              },
              'basics-5': {
                title: 'Anfahren am Berg (Schaltgetriebe)',
                description: 'Berganfahren ohne Zurückrollen mit Handbremse oder Fußbremse',
                tips: [
                  { id: 'hill-tip1', title: 'Schleifpunkt halten', content: 'Kupplung zum Schleifpunkt bringen, bis sich das Motorgeräusch ändert und das Auto leicht "zieht", dann Handbremse lösen.', type: 'info' },
                  { id: 'hill-tip2', title: 'Prüfungsrelevant!', content: 'In der Prüfung wird oft am Berg angefahren. Üben Sie beide Methoden (Handbremse und Fußbremse)!', type: 'warning' }
                ]
              },
              'basics-5a': {
                title: 'Anfahren am Berg (Automatik)',
                description: 'Berganfahren mit Automatikgetriebe und Hill-Hold-Assistent',
                tips: [
                  { id: 'hill-auto-tip1', title: 'Hill-Hold-Assist', content: 'Viele moderne Automatik-Fahrzeuge haben Hill-Hold-Assist, der das Auto 2-3 Sekunden hält.', type: 'info' },
                  { id: 'hill-auto-tip2', title: 'Ohne Hill-Hold', content: 'Bremse halten, dann zügig Gas geben. Die Kriechfunktion verhindert meist starkes Zurückrollen.', type: 'info' }
                ]
              },
              'maneuver-1': {
                title: 'Einparken längs (Parallel)',
                description: 'Seitliches Einparken zwischen zwei Fahrzeugen',
                scenarioSectionTitle: 'Park-Herausforderungen',
                scenarioSectionSubtitle: 'Häufige Situationen beim Längsparken',
                tips: [
                  { id: 'park-tip1', title: 'Bezugspunkte nutzen', content: 'Nutzen Sie die Rückleuchten oder B-Säule des stehenden Autos als Orientierung zum Einlenken.', type: 'info' }
                ]
              },
              'maneuver-2': {
                title: 'Einparken rückwärts',
                description: 'Rückwärts in eine Parkbox einfahren',
                tips: [
                  { id: 'park-rev-tip1', title: 'Bezugspunkte nutzen', content: 'Bei 45 Grad einlenken, wenn der eigene Außenspiegel die Rückleuchte des stehenden Autos passiert.', type: 'info' }
                ]
              },
              'maneuver-3': {
                title: 'Wenden (Drei-Punkt-Wende)',
                description: 'Wenden in einer engen Straße',
                tips: [
                  { id: 'turn-tip1', title: 'Langsam rollen, schnell lenken', content: 'Fahrzeug im Stand oder sehr langsam rollen lassen und dabei zügig lenken.', type: 'info' }
                ]
              },
              'maneuver-4': {
                title: 'Gefahrenbremsung (Schaltgetriebe)',
                description: 'Vollbremsung aus Tempo 30 - Kupplung + Bremse',
                tips: [
                  { id: 'brake-tip1', title: 'Volle Kraft!', content: 'Bei der Prüfung wird erwartet, dass Sie wirklich VOLL bremsen. Keine halben Sachen!', type: 'warning' },
                  { id: 'brake-tip2', title: 'Kupplung erst nach der Bremsung', content: 'Beim Schaltwagen zuerst hart bremsen. Die Kupplung erst danach bzw. kurz vor dem Abwürgen treten, damit die Verzögerung maximal bleibt.', type: 'warning' }
                ]
              },
              'maneuver-4a': {
                title: 'Gefahrenbremsung (Automatik)',
                description: 'Vollbremsung aus Tempo 30 - Nur Bremse',
                tips: [
                  { id: 'brake-auto-tip1', title: 'Volle Kraft!', content: 'Bei der Prüfung wird erwartet, dass Sie wirklich VOLL bremsen. Keine halben Sachen!', type: 'warning' },
                  { id: 'brake-auto-tip2', title: 'Nur Bremse!', content: 'Beim Automatik-Fahrzeug entfällt das Kuppeln. Konzentrieren Sie sich voll auf den Bremsdruck.', type: 'info' }
                ]
              },
              'city-1': {
                title: 'Rechts vor Links',
                description: 'Vorfahrt an Kreuzungen ohne Schilder (§ 8 StVO)',
                tips: [
                  { id: 'rvl-tip1', title: 'Überall möglich!', content: 'An Kreuzungen OHNE Ampel, Schilder oder Polizei. Auch in 30er-Zonen und verkehrsberuhigten Bereichen!', type: 'info' },
                  { id: 'rvl-tip2', title: '§ 10 StVO-Ausnahmen beachten!', content: 'Wer aus Grundstücken, Fußgängerzonen, verkehrsberuhigten Bereichen, Feld-/Waldwegen oder über einen abgesenkten Bordstein auf die Fahrbahn einfährt, muss allen anderen Vorrang gewähren.', type: 'warning' }
                ],
                scenarioSectionTitle: 'Spezielle Rechts-vor-Links Situationen',
                scenarioSectionSubtitle: 'Wichtige Einzelfälle, die in der Prüfung oft vorkommen'
              },
              'city-2': {
                title: 'Abbiegen (Links)',
                description: 'Linksabbiegen mit Gegenverkehr, Ampelphasen und Einordnung',
                scenarioSectionTitle: 'Typische Abbiegesituationen',
                scenarioSectionSubtitle: 'Schritt-fÃ¼r-Schritt-Anleitung fÃ¼r sicheres Linksabbiegen',
                tips: [
                  { id: 'amp-tip1', title: 'Grünpfeilschild ≠ grüner Pfeil als Lichtzeichen', content: 'Das Grünpfeilschild (Zeichen 720) ist ein Blechschild an der roten Ampel: erst vollständig anhalten, dann vortasten und allem Verkehr Vorrang geben. Der grüne Pfeil als Lichtzeichen in der Ampel ist dagegen eine geschützte Freigabe ohne zusätzlichen Pflichtstopp.', type: 'warning' },
                  { id: 'amp-tip2', title: 'Haltlinie ist nicht Sichtlinie', content: 'Beim Grünpfeilschild muss das Fahrzeug zuerst wirklich an der Haltlinie stillstehen. Erst danach darf man sich langsam zur besseren Sicht vortasten.', type: 'info' },
                  { id: 'amp-tip3', title: 'Hinweis für Radverkehr', content: 'Es gibt inzwischen auch Grünpfeil-Regelungen nur für Radfahrer. Für Autofahrer bleibt entscheidend: Schild und Lichtsignal klar unterscheiden.', type: 'info' }
                ],
                glossary: [
                  { id: 'lt-green-arrow-light', term: 'Grünpfeilampel', note: 'Geschützte Linksabbiegephase innerhalb der Ampel. Gegenverkehr hat in der Regel Rot.' },
                  { id: 'lt-green-arrow-sign', term: 'Grüner Blechpfeil', note: 'Nur nach vollständigem Halt an der Haltlinie und anschließendem vorsichtigen Vorrollen zulässig.' },
                  { id: 'lt-tangential', term: 'Tangentiales Abbiegen', note: 'Wenn beide entgegenkommenden Fahrzeuge links abbiegen, drehen sie meist voreinander ab.' }
                ],
                examinerCommands: [
                  { id: 'lt-cmd-left', command: 'An der nächsten Ampel bitte links abbiegen.', note: '' },
                  { id: 'lt-cmd-arrow', command: 'Bitte folgen Sie dem Verlauf der Vorfahrtstraße.', note: '' }
                ]
              },
              'city-3': {
                title: 'Kreisverkehr',
                description: 'Einfahren, Blinkzeichen und Vorfahrt im Kreisverkehr',
                scenarioSectionTitle: 'Kreisverkehr-Szenarien',
                scenarioSectionSubtitle: 'Alles zum Thema Kreisverkehr und Vorfahrt',
                tips: [
                  { id: 'kreis-tip1', title: 'NICHT beim Einfahren blinken!', content: 'Beim Einfahren in den Kreisverkehr ist Blinken VERBOTEN (könnte als sofortiges Verlassen missverstanden werden).', type: 'warning' },
                  { id: 'kreis-tip2', title: 'Beim Ausfahren blinken!', content: 'Nach Passieren der vorherigen Ausfahrt RECHTS blinken um das Verlassen anzuzeigen.', type: 'info' },
                  { id: 'kreis-tip3', title: 'Vorfahrt im Kreisel', content: 'Mit Zeichen 205 + 215: Fahrzeuge IM Kreisverkehr haben Vorfahrt. Ohne Schilder gilt Rechts-vor-Links!', type: 'warning' }
                ]
              },
              'city-4': {
                title: 'Zebrastreifen',
                description: 'Richtiges Verhalten am Fußgängerüberweg',
                scenarioSectionTitle: 'Fußgänger-Interaktionen',
                scenarioSectionSubtitle: 'Sicherer Umgang mit Fußgängern am Zebrastreifen',
                tips: [
                  { id: 'zebra-tip1', title: 'Absoluter Vorrang!', content: 'Fußgänger auf dem Zebrastreifen haben IMMER Vorrang. Auch wenn sie erst einen Fuß auf die Straße setzen!', type: 'warning' }
                ]
              },
              'city-5': {
                title: 'Rechtsabbiegen',
                description: 'Sicher rechts abbiegen mit Blick auf Radfahrer, Fußgänger und Ampelsituationen',
                scenarioSectionTitle: 'Sicheres Rechtsabbiegen',
                scenarioSectionSubtitle: 'Herausforderungen wie Radwege und Fußgänger meistern',
                tips: [
                  { id: 'right-tip1', title: 'Radfahrer nicht abschneiden', content: 'Der Schulterblick nach rechts unmittelbar vor dem Abbiegen ist in der Prüfung absolut entscheidend.', type: 'warning' }
                ]
              },
              'city-5a': {
                title: 'Verkehrsberuhigter Bereich & Zone 30',
                description: 'Die oft verwechselten Unterschiede zwischen Spielstraße/verkehrsberuhigtem Bereich und 30er-Zone.',
                guidedPoints: [
                  { id: 'vb-gp1', title: 'Schrittgeschwindigkeit im VBB', content: 'In einem verkehrsberuhigten Bereich (Zeichen 325.1) gilt Schrittgeschwindigkeit für alle – auch für Radfahrer.' },
                  { id: 'vb-gp2', title: 'Vorfahrt beim Verlassen', content: 'Wer aus einem verkehrsberuhigten Bereich herausfährt, muss allen anderen Verkehrsteilnehmern Vorrang gewähren (§ 10 StVO). In der 30er-Zone gilt meist Rechts-vor-Links.' },
                  { id: 'vb-gp3', title: 'Engstelle vor T-Kreuzung richtig lösen', content: 'In 30er-Zonen gibt es häufig parkende Fahrzeuge direkt vor oder nach einer Kreuzung. Dann geht es nicht nur um Rechts-vor-Links, sondern auch um Raum schaffen, Blickführung und korrekte Blinker.' }
                ],
                scenarios: [
                  {
                    id: 'vb-sc1',
                    title: 'Die Kreuzungstasche in der 30er-Zone',
                    situation: 'Ein parkendes Fahrzeug blockiert Ihre Spur kurz vor einer T-Kreuzung. Von rechts kommt eine Seitenstraße. Direkt nach der Kreuzung blockiert ein weiteres Fahrzeug Ihre Spur und es kommt Gegenverkehr. Viele Fahrschüler blinken hier falsch oder blockieren die Kreuzung.',
                    steps: [
                      { id: 1, title: 'Links blinken für erste Engstelle', description: 'Links blinken, Innen- und Außenspiegel prüfen, Schulterblick links und am ersten parkenden Fahrzeug vorbeifahren. Das zeigt klar: Ich weiche wegen des Hindernisses zur Fahrbahnmitte aus.', icon: 'ArrowLeft' },
                      { id: 2, title: 'In die Kreuzungstasche einfahren – OHNE Rechtsblinker', description: 'An der T-Kreuzung angekommen, ziehen Sie leicht nach rechts in die Mündung der Seitenstraße, um Raum zu schaffen. Beachten Sie Rechts-vor-Links. Blinken Sie NICHT rechts, da Sie nicht abbiegen. Ein falscher Rechtsblinker könnte den Verkehr von rechts täuschen.', icon: 'ArrowRight' },
                      { id: 3, title: 'Fahrzeug von rechts herauslassen', description: 'Warten Sie ruhig in Ihrer Ausweichposition und lassen Sie das Fahrzeug von rechts abbiegen oder einfädeln. Sie blockieren nicht die Kreuzung, sondern schaffen bewusst Platz für den Verkehrsfluss.', icon: 'Shield' },
                      { id: 4, title: 'Auf zweite Engstelle mit Linksblinker vorbereiten', description: 'Wenn das Fahrzeug von rechts weg ist, schauen Sie nach vorn: Wenn direkt nach der Kreuzung wieder ein Hindernis auf Ihrer Seite steht und Gegenverkehr kommt, setzen Sie den Linksblinker. Das sagt dem Gegenverkehr: Ich habe dich gesehen und warte, bis ich am zweiten Hindernis vorbeifahren darf.', icon: 'ArrowLeft' },
                      { id: 5, title: 'Gegenverkehr durchlassen, dann sauber vorbeifahren', description: 'Da das zweite parkende Fahrzeug auf Ihrer Seite steht, hat der Gegenverkehr Vorrang. Warten Sie, bis die Straße frei ist, dann prüfen Sie erneut Spiegel und linken Schulterblick und fahren kontrolliert am zweiten Hindernis vorbei.', icon: 'Eye' }
                    ]
                  }
                ],
                tips: [
                  { id: 'vb-tip1', title: 'Klassische Prüfungsfalle', content: 'Viele Umschreiber behandeln einen verkehrsberuhigten Bereich wie eine normale Straße. Das ist falsch.', type: 'warning' },
                  { id: 'vb-tip2', title: 'Blinkerfalle in der Kreuzungstasche', content: 'Blinken Sie nicht rechts, wenn Sie nur kurz in die Seitenstraßenmündung einfahren, um Platz zu schaffen. Ein Rechtsblinker würde ein echtes Abbiegen vortäuschen und könnte andere Verkehrsteilnehmer täuschen.', type: 'warning' },
                  { id: 'vb-tip3', title: 'Typische Fehler', content: 'Typische Fehler sind das Blockieren der Kreuzung, kein Platz lassen für den Verkehr von rechts oder das Vergessen des Gegenverkehrs und des erneuten Schulterblicks links beim zweiten Hindernis.', type: 'warning' }
                ]
              },
              'city-5b': {
                title: 'Reißverschlussverfahren',
                description: 'Einfädeln bei Fahrstreifenreduzierung (§ 7 StVO)',
                guidedPoints: [
                  { id: 'zip-gp1', title: 'Bis zum Ende mitfahren', content: 'Nicht schon 100 Meter vorher panisch wechseln. Die endende Spur wird bis kurz vor das Hindernis genutzt.' },
                  { id: 'zip-gp2', title: 'Abwechselnd einfädeln', content: 'Ein Fahrzeug aus der weiterführenden Spur, dann ein Fahrzeug aus der endenden Spur – wie ein Reißverschluss.' }
                ],
                tips: [
                  { id: 'zip-tip1', title: 'Nicht zu früh wechseln', content: 'Zu frühes Wechseln stört den Verkehrsfluss und ist genau das, was viele Prüfer bei Umschreibern kritisieren.', type: 'warning' }
                ]
              },
              'city-5c': {
                title: 'Linienbusse & Haltestellen',
                description: 'Verhalten bei Bussen mit Warnblinklicht (§ 20 StVO)',
                guidedPoints: [
                  { id: 'bus-gp1', title: 'Warnblinker am Bus ernst nehmen', content: 'Wenn ein Linienbus an der Haltestelle Warnblinker eingeschaltet hat, darf nur mit Schrittgeschwindigkeit vorbeigefahren werden.' },
                  { id: 'bus-gp2', title: 'Auch Gegenverkehr betroffen', content: 'Die Vorsicht gilt je nach Situation auch für Fahrzeuge in der Gegenrichtung. Kinder können jederzeit auftauchen.' }
                ],
                tips: [
                  { id: 'bus-tip1', title: 'Keine Eile an der Haltestelle', content: 'Bushaltestellen sind für Prüfer echte Gefahrenstellen. Fußgänger und Kinder immer mitdenken.', type: 'warning' }
                ]
              },
              'city-6': {
                title: 'Fahrstreifenwechsel',
                description: 'Spiegel, Blinker und Schulterblick im Stadtverkehr',
                tips: [
                  { id: 'spur-tip1', title: 'Reihenfolge beachten!', content: '1. Innenspiegel 2. Außenspiegel 3. Blinker 4. Schulterblick (Toter Winkel!) 5. Spurwechsel', type: 'info' }
                ]
              },
              'city-7': {
                title: 'Halten & Parken',
                description: 'Rechtliche Grundlagen und Beschilderung (§ 12 StVO)',
                guidedPoints: [
                  { id: 'stoppark-gp1', title: '3-Minuten-Regel kennen', content: 'Wer länger als drei Minuten hält oder das Fahrzeug verlässt, parkt im rechtlichen Sinn.' },
                  { id: 'stoppark-gp2', title: 'Zeichen und Bordsteinbereiche lesen', content: 'Absolutes Halteverbot, eingeschränktes Halteverbot, Bushaltestellen, Kreuzungsnähe und Einfahrten sauber unterscheiden.' }
                ],
                tips: [
                  { id: 'stoppark-tip1', title: 'Prüferfrage-Klassiker', content: 'Prüfer fragen gern unterwegs: "Dürften Sie hier halten oder parken?" Antworten Sie ruhig mit Regel plus Begründung.', type: 'info' }
                ]
              },
              'city-8': {
                title: 'Einfahren & Ausfahren',
                description: 'Verhalten bei Grundstücken und Parkflächen (§ 10 StVO)',
                guidedPoints: [
                  { id: 'prop-gp1', title: 'Allen Vorrang gewähren', content: 'Beim Einfahren auf die Straße aus Grundstücken, Parkflächen, Tankstellen oder verkehrsberuhigten Bereichen gilt § 10 StVO: andere nicht gefährden und allen Vorrang gewähren.' },
                  { id: 'prop-gp2', title: 'Blinken und Schulterblick nicht vergessen', content: 'Auch beim Herausfahren gilt: Beobachten, Absicht klar anzeigen und unmittelbar vor der seitlichen Bewegung den Schulterblick zeigen.' }
                ]
              },
              'city-9': {
                title: 'Bahnübergang',
                description: 'Sicheres Verhalten am Andreaskreuz (§ 19 StVO)',
                guidedPoints: [
                  { id: 'rail-gp1', title: 'Andreaskreuz ernst nehmen', content: 'Am Andreaskreuz hat der Schienenverkehr Vorrang. Niemals dicht auffahren oder auf den Gleisen anhalten.' },
                  { id: 'rail-gp2', title: 'Blink- oder Schrankenanlage beachten', content: 'Bei rotem Blinklicht oder sich senkender Schranke ist vor dem Übergang anzuhalten. Nicht überholen und keine Eile.' }
                ]
              },
              'city-10': {
                title: 'Einsatzfahrzeuge',
                description: 'Blaulicht und Martinshorn (§ 38 StVO)',
                guidedPoints: [
                  { id: 'ev-gp1', title: 'Ruhe bewahren und Platz schaffen', content: 'Früh erkennen, wohin Sie sicher ausweichen können. Nach rechts orientieren, ggf. anhalten, aber niemals Schutzwege oder Gleise blockieren.' }
                ]
              },
              'city-11': {
                title: 'Baustellen & Engstellen',
                description: 'Einspurige Verkehrsführung und Hindernisse (§ 6 StVO)',
              },
              'special-1': {
                title: 'Überlandfahrt (Landstraße)',
                description: 'Höhere Geschwindigkeiten, Überholen und Alleen',
                scenarioSectionTitle: 'Landstraßen-Szenarien',
                scenarioSectionSubtitle: 'Gefahren und Besonderheiten außerorts meistern',
                tips: [
                  { id: 'country-tip1', title: 'Überholverbot beachten', content: 'Durchgezogene Linie = Absolutes Überholverbot!', type: 'warning' }
                ]
              },
              'special-2': {
                title: 'Autobahn (Autobahnfahrt)',
                description: 'Auffahren, Abfahren, Spurwechsel bei hohen Geschwindigkeiten und Rettungsgasse',
                scenarioSectionTitle: 'Autobahn-Szenarien',
                scenarioSectionSubtitle: 'Sicherer Umgang mit hohen Geschwindigkeiten',
                tips: [
                  { id: 'highway-tip1', title: 'Beschleunigungsstreifen nutzen', content: 'Auf dem Beschleunigungsstreifen Gas geben und Fließverkehr beachten.', type: 'info' }
                ]
              },
              'special-2a': {
                title: 'Autobahn-Sonderregeln',
                description: 'Rettungsgasse, Beschleunigungsstreifen und typische Autobahn-Fehler in der Prüfung.',
                glossary: [
                  { id: 'motorway-ret', term: 'Rettungsgasse', note: 'Bei Stau: linke Spur nach links, alle anderen nach rechts.' },
                  { id: 'motorway-acc', term: 'Beschleunigungsstreifen', note: 'Zum Angleichen an die Geschwindigkeit des fließenden Verkehrs nutzen – nicht zum frühzeitigen Bremsen.' }
                ],
                guidedPoints: [
                  { id: 'motorway-gp1', title: 'Rettungsgasse sofort bilden', content: 'Sobald der Verkehr stockt, bilden Sie die Gasse – nicht erst, wenn das Blaulicht sichtbar ist.' },
                  { id: 'motorway-gp2', title: 'Am Ende des Beschleunigungsstreifens nicht unnötig bremsen', content: 'Auf dem Beschleunigungsstreifen aktiv beschleunigen, Lücke suchen und entschlossen einfädeln. Bremsen am Ende ist ein häufiger Prüfungsfehler.' }
                ],
                tips: [
                  { id: 'motorway-tip1', title: 'Links schafft Platz, rechts ebenso', content: 'Die Rettungsgasse entsteht immer zwischen der linken Spur und allen übrigen Spuren rechts davon.', type: 'info' }
                ]
              },
              'special-3': {
                title: 'Nachtfahrt (Beleuchtung)',
                description: 'Lichtfunktionen, Sichtweiten und Wildgefahr in der Dunkelheit',
                scenarioSectionTitle: 'Nacht-Szenarien',
                scenarioSectionSubtitle: 'Herausforderungen bei Dunkelheit und schlechter Sicht',
                scenarios: [
                  {
                    id: 'night-pedestrian',
                    title: 'Schlecht sichtbarer Fußgänger',
                    situation: 'Innerorts taucht ein dunkel gekleideter Fußgänger nahe eines geparkten Autos auf.',
                    steps: [
                      { id: 1, title: 'Geschwindigkeit anpassen', description: 'Früh verlangsamen, weil Ihre Sicht eingeschränkt ist.', icon: 'Circle' },
                      { id: 2, title: 'Blick an Fahrbahnrand', description: 'Bewegungen am Fahrbahnrand aktiv suchen, besonders bei Bushaltestellen und parkenden Autos.', icon: 'Eye', critical: true },
                      { id: 3, title: 'Bremsbereit bleiben', description: 'Halten Sie genügend Reserve, um vor einem plötzlich querenden Fußgänger sicher anzuhalten.', icon: 'AlertTriangle', critical: true }
                    ]
                  }
                ],
                tips: [
                  { id: 'night-tip1', title: 'Fernlicht richtig nutzen', content: 'Fernlicht nur außerorts und wenn kein Gegenverkehr!', type: 'warning' }
                ]
              },
              'special-4': {
                title: 'Gefahrenlehre & defensives Fahren',
                description: 'Gefahren früh erkennen: Kinder, Lieferwagen, Wetter, Sichtbehinderung und typische Überraschungen im deutschen Straßenverkehr.',
                guidedPoints: [
                  { id: 'haz-gp1', title: 'Nicht nur Regeln, sondern Hinweise lesen', content: 'Ball auf der Fahrbahn, Eiswagen, geöffnete Lieferwagenschiebetür oder suchender Blick eines Radfahrers sind Warnzeichen für die nächste Gefahr.' },
                  { id: 'haz-gp2', title: 'Geschwindigkeit proaktiv anpassen', content: 'Defensives Fahren heißt: lieber früh entschärfen als später hart reagieren.' }
                ]
              },
              'exam-1': {
                title: 'Prüfungsreife & Checkliste',
                description: 'Letzte Kontrolle vor der praktischen Prüfung.',
                scenarios: [
                  {
                    id: 'exam-first-minutes',
                    title: 'Die ersten Minuten',
                    situation: 'Der Prüfer stellt sich vor, kontrolliert den Ausweis und stellt ggf. technische Fragen zum Fahrzeug.',
                    steps: [
                      { id: 1, title: 'Dokumente bereithalten', description: 'Lichtbildausweis oder Reisepass griffbereit haben.', icon: 'FileText' },
                      { id: 2, title: 'Sitz & Spiegel einstellen', description: 'Auch wenn es schon passt: Kurz prüfen und ggf. nachstellen, um Sorgfalt zu zeigen.', icon: 'Settings' },
                      { id: 3, title: 'Gurt anlegen', description: 'Nicht vergessen, bevor der Motor gestartet wird!', icon: 'CheckCircle' }
                    ]
                  }
                ],
                tips: [
                  { id: 'check-tip1', title: 'Mitbringen zur Prüfung', content: '✓ Personalausweis/Reisepass ✓ Ggf. Sehhilfe (Brille) ✓ Bescheinigung Theorieprüfung ✓ Ausbildungsnachweis', type: 'warning' },
                  { id: 'check-tip2', title: 'Prüfungsdauer', content: 'Die praktische Prüfung dauert ca. 45 Minuten. 3 Grundfahraufgaben werden geprüft (aus dem Katalog ausgewählt).', type: 'info' }
                ]
              },
              'exam-1a': {
                title: 'Fahrzeug sicher verlassen (Holländischer Griff)',
                description: 'Sicheres Türöffnen am Ende der Prüfung und im Alltag.',
                glossary: [
                  { term: 'Holländischer Griff', note: 'Die Tür mit der weiter entfernten Hand öffnen, damit sich der Oberkörper automatisch dreht und der Schulterblick leichter fällt.' }
                ],
                guidedPoints: [
                  { id: 'exit-gp1', title: 'Vor dem Öffnen Spiegel prüfen', content: 'Blick in den Innenspiegel und linken Außenspiegel.' },
                  { id: 'exit-gp2', title: 'Schulterblick nach hinten', content: 'Prüfen, ob ein Radfahrer oder Pkw von hinten kommt.' },
                  { id: 'exit-gp3', title: 'Tür nur einen Spalt öffnen', content: 'Zuerst nur kurz öffnen, um erneut zu sichern, bevor man ganz aussteigt.' }
                ]
              },
              'exam-2': {
                title: 'Prüfungsangst bewältigen',
                description: 'Tipps gegen Nervosität am Prüfungstag.',
                tips: [
                  { id: 'anxiety-tip1', title: 'Der Prüfer will dass Sie bestehen!', content: 'Der Prüfer bewertet nach dem Fahraufgabenkatalog - objektiv und fair. Kleine Fehler führen nicht zum Durchfallen.', type: 'success' },
                  { id: 'anxiety-tip2', title: 'Ausreichend Schlaf', content: 'Gehen Sie früh ins Bett und verzichten Sie auf zu viel Koffein vor der Prüfung.', type: 'info' }
                ]
              },
              'exam-2a': {
                title: 'Top-Gründe für das Nichtbestehen',
                description: 'Die wichtigsten Situationen, die in der praktischen Prüfung direkt zum Nichtbestehen führen können.',
                guidedPoints: [
                  { id: 'fail-gp1', title: 'Gefährdung geht immer vor Formfehler', content: 'Wer Vorfahrt nimmt, Fußgänger gefährdet, rote Ampeln missachtet oder massiv unsicher fährt, fällt in der Regel sofort durch.' },
                  { id: 'fail-gp2', title: 'Schulterblick kann entscheidend sein', content: 'Einmal vergessen ist oft kein Problem, aber mehrmaliges Ignorieren des Schulterblicks (z.B. beim Abbiegen) führt zum Nichtbestehen.' }
                ]
              },
              'exam-3': {
                title: 'Umweltbewusstes Fahren',
                description: 'Spritsparendes Fahren und niedrige Drehzahlen.',
                tips: [
                  { id: 'eco-tip1', title: 'Früh hochschalten', content: 'Zwischen 2000-2500 U/min hochschalten. Niedertouriges Fahren spart Kraftstoff.', type: 'info' },
                  { id: 'eco-tip2', title: 'Vorausschauend fahren', content: 'Rollen lassen statt bremsen, wenn eine Ampel rot ist.', type: 'info' }
                ]
              },
              'exam-sim': {
                title: 'Test-Prüfung: Live-Sim',
                description: 'Realistische Simulation mit Zeitdruck und Feedback.'
              }
            },
            parallelParkingSteps: [
              { title: 'Parklücke bewusst auswählen', description: 'Fahren Sie langsam und wählen Sie eine Lücke, die realistisch groß genug ist. Im Zweifel lieber weiterfahren als hektisch eine zu enge Lücke erzwingen.' },
              { title: 'Neben dem vorderen Fahrzeug anhalten', description: 'Rechts blinken und parallel neben dem vorderen Fahrzeug anhalten. Ein praxistauglicher Referenzpunkt ist oft: Ihr rechter Außenspiegel steht ungefähr auf Höhe von dessen B-Säule oder hinterem Türbereich.' },
              { title: 'Rundum-Blick vor dem ersten Rückwärtsweg', description: 'Vor dem ersten Rückwärtsrollen den Verkehrsraum vollständig sichern: links prüfen, Spiegel kontrollieren, rechts prüfen und den Heckraum durch Seiten- und Heckscheiben absichern.' },
              { title: 'Mit rechtem Schulterblick in die Lücke einlenken', description: 'Langsam rückwärts rollen. Unmittelbar vor dem Einschlagen den rechten Schulterblick klar zeigen, um Radfahrer und Fußgänger auf der Bordsteinseite zu sichern. Dann voll nach rechts einschlagen. Ein fahrzeugnaher Referenzpunkt kann mit dem Fahrlehrer kalibriert werden, zum Beispiel wenn das vordere Fahrzeug im rechten Spiegel eine bestimmte Position erreicht.' },
              { title: 'Gegenlenkpunkt aus Fahrerperspektive nutzen', description: 'Wenn der Einlenkwinkel erreicht ist und Sie im Spiegel bzw. Seitenfenster den passenden Gegenlenkpunkt erkennen, voll nach links gegenlenken. Typische Referenzen sind immer fahrzeugabhängig und müssen im Fahrschulauto geübt werden.' },
              { title: 'Parallel ausrichten und Bordsteinabstand prüfen', description: 'Richten Sie das Fahrzeug parallel zum Bordstein aus. Prüfen Sie über Spiegel und Sicht nach vorne/hinten den Abstand – Ziel in der Prüfung: sauber parallel und höchstens etwa 30 cm vom Bordstein entfernt.' },
              { title: 'Bei Vorwärtskorrektur linken Schulterblick', description: 'Wenn Sie zur Korrektur wieder vorwärts fahren müssen, sichern Sie die Fahrbahnseite mit Spiegeln und linkem Schulterblick, bevor Sie nach vorne ziehen. Danach bei weiterem Rückwärtsweg erneut rundum sichern.' }
            ],
            reverseParkingSteps: [
              { title: 'Startposition sauber vorbereiten', description: 'Fahren Sie an der Ziel-Parkbox vorbei und stellen Sie Ihr Fahrzeug parallel mit etwa 0,8 bis 1,0 m Abstand auf. Die genaue Startposition und Referenzpunkte müssen mit dem Fahrschulauto geübt werden.' },
              { title: 'Rundum-Blick vor dem Rückwärtsfahren', description: 'Vor dem Rückwärtsweg alle Spiegel prüfen und mit Rundum-Blick beide Seiten sowie den Bereich hinter dem Fahrzeug absichern.' },
              { title: 'Am fahrzeugbezogenen Punkt einlenken', description: 'Rollen Sie sehr langsam rückwärts. Sobald Ihr im Fahrschulauto geübter Einlenkpunkt erreicht ist – zum Beispiel Schulter, Spiegel oder hintere Seitenscheibe auf Höhe einer Parklinien-Markierung – lenken Sie zügig ein.' },
              { title: 'Linien in beiden Spiegeln kontrollieren', description: 'Beobachten Sie beide Seitenlinien in den Außenspiegeln. Das Fahrzeug soll gleichmäßig in die Box laufen und nicht eine Linie schneiden.' },
              { title: 'Zum richtigen Zeitpunkt gerade stellen', description: 'Wenn das Fahrzeug nahezu parallel zu den Parklinien steht, das Lenkrad zügig gerade stellen und weiter langsam zurücksetzen.' },
              { title: 'Endposition prüfen und zentrieren', description: 'Endkontrolle: Fahrzeug gerade, mittig in der Parkbox, mit ähnlichem Abstand zu beiden Linien und ohne vorne oder hinten herauszuragen.' }
            ],
            threePointTurnSteps: [
              { title: 'Verkehr beobachten', description: 'Rundum-Blick! Ist die Straße frei in beide Richtungen? Kein Wendeverbote?' },
              { title: 'Blinker links', description: 'Links blinken und langsam anfahren. Voll nach links einschlagen.' },
              { title: 'Vor dem Bordstein stoppen', description: 'Kurz vor dem gegenüberliegenden Bordstein anhalten.' },
              { title: 'Schulterblick & Rückwärts', description: 'Schulterblick! Voll nach rechts einschlagen und rückwärts fahren.' },
              { title: 'Erneut stoppen', description: 'Kurz vor dem Bordstein hinter Ihnen anhalten.' },
              { title: 'Vorwärts ausfahren', description: 'Nach links einschlagen und in die neue Fahrtrichtung ausfahren.' }
            ],
            emergencyBrakingStepsManual: [
              { title: 'Geschwindigkeit: ca. 30 km/h', description: 'Die Gefahrenbremsung wird aus ca. 30 km/h durchgeführt. Der Fahrlehrer gibt das Kommando.' },
              { title: 'Kein Schulterblick vor der Bremsung', description: 'WICHTIG: Bei der Gefahrenbremsung sichert der Fahrlehrer den rückwärtigen Verkehr. Sie reagieren sofort nach vorn.' },
              { title: 'Zuerst hart bremsen', description: 'Sofort mit voller Kraft auf das Bremspedal. Ziel ist maximale Verzögerung bei stabiler Spurhaltung.' },
              { title: 'Kupplung erst danach treten', description: 'Die Kupplung erst nach Beginn der Vollbremsung bzw. kurz vor dem Abwürgen treten, damit der Motor nicht abstirbt.' },
              { title: 'Lenkrad fest und gerade halten', description: 'Mit beiden Händen festhalten, gerade bleiben und nur ausweichen, wenn der Fahrlehrer dies ausdrücklich trainiert.' },
              { title: 'ABS-Pulsieren akzeptieren', description: 'Wenn das Pedal pulsiert, arbeitet das ABS. Den Bremsdruck nicht wieder lösen.' },
              { title: 'Vor erneutem Anfahren absichern', description: 'Nach dem Stillstand: Fahrzeug sichern und vor dem erneuten Anfahren Spiegel und linken Schulterblick durchführen.' }
            ],
            emergencyBrakingStepsAutomatic: [
              { title: 'Geschwindigkeit: ca. 30 km/h', description: 'Die Gefahrenbremsung wird aus ca. 30 km/h durchgeführt. Der Fahrlehrer gibt das Kommando.' },
              { title: 'Kein Schulterblick vor der Bremsung', description: 'WICHTIG: Bei der Gefahrenbremsung sichert der Fahrlehrer den rückwärtigen Verkehr. Sie reagieren sofort nach vorn.' },
              { title: 'Nur Bremse – volle Kraft', description: 'Bei Automatik sofort mit voller Kraft auf das Bremspedal. Kein Kupplungsvorgang nötig.' },
              { title: 'Lenkrad fest und gerade halten', description: 'Mit beiden Händen festhalten, gerade bleiben und nicht hektisch ausweichen.' },
              { title: 'ABS-Pulsieren akzeptieren', description: 'Wenn das Pedal pulsiert, arbeitet das ABS. Den Bremsdruck nicht wieder lösen.' },
              { title: 'Vor erneutem Anfahren absichern', description: 'Nach dem Stillstand Fahrzeug sichern und vor dem erneuten Anfahren Spiegel und linken Schulterblick durchführen.' }
            ],
            maneuverTips: [
              { title: 'Rundum-Blick nicht vergessen!', content: 'Der häufigste Fehler bei der Prüfung! Vor jedem Rückwärtsfahren Rundum-Blick durchführen und bei jedem Richtungswechsel den passenden Schulterblick klar zeigen.' },
              { title: 'Langsam fahren (1-3 km/h)', content: 'Bei Manövern extrem langsam fahren: 1-3 km/h. Im Schaltwagen mit Kupplung und Bremse fein dosieren, im Automatikfahrzeug mit Kriechgeschwindigkeit und leichtem Bremseinsatz arbeiten.' },
              { title: 'Maximal 2x korrigieren', content: 'Bei der Prüfung sind 2 Korrekturen erlaubt. Beim Korrigieren: Blinken nicht vergessen!' },
              { title: 'Abstand zum Bordstein', content: 'Beim Längsparken: Max. 30cm zum Bordstein (etwa DIN A4 Breite). Näher = besser!' },
              { title: 'Verkehr beachten', content: 'Andere Verkehrsteilnehmer haben Vorrang. Blickkontakt aufnehmen und ggf. vorbeiwinken.' }
            ],
            leftTurnGuidedPoints: [
              { title: 'Frühzeitig einordnen', content: 'Rechtzeitig links einordnen, Geschwindigkeit reduzieren und den rückwärtigen Verkehr im Innen- und Außenspiegel prüfen.' },
              { title: 'Blickführung', content: 'Beobachten Sie Gegenverkehr, querende Fußgänger, Radfahrer auf Radwegen und Fahrzeuge, die Sie überholen könnten.' },
              { title: 'Unterscheide geschützte und ungeschützte Abbiegung', content: 'Bei normalem Grün müssen Sie in der Regel dem Gegenverkehr und querenden Fußgängern/Radfahrern Vorrang geben. Bei grünem Linksabbiegepfeil haben Gegenverkehr und querende Fußgänger meist Rot.' },
              { title: 'Einbahnstraße korrekt nutzen', content: 'Aus einer Einbahnstraße vor dem Linksabbiegen möglichst weit links einordnen. Beim Einbiegen in eine Einbahnstraße trotzdem die richtige Spur wählen und das Rechtsfahrgebot beachten.' },
              { title: 'Abknickende Vorfahrt vollständig verstehen', content: 'Folgen Sie der abknickenden Vorfahrt, blinken Sie in Richtung des Straßenverlaufs. Verlassen Sie die Vorfahrtstraße durch ein echtes Abbiegen, müssen Sie ebenfalls blinken. Zusätzlich müssen Fahrzeuge, die die Vorfahrtstraße verlassen, untereinander auf Vorfahrt und gegenseitige Behinderung achten.' },
              { title: 'Straßenbahn und Mehrspuren ernst nehmen', content: 'Straßenbahnen haben praktisch oft Vorrang und sollten nicht geschnitten werden. Bei mehrspurigen Linksabbiegern müssen Sie Ihre Spur exakt halten und Leitlinien sauber folgen.' },
              { title: 'Prüfungsblick', content: 'Der Prüfer achtet darauf, dass Sie kurz vor dem Abbiegen noch einmal nach links-rechts-vorn prüfen und ruhig abbiegen.' }
            ],
            glossary: [
              { term: 'Schulterblick', note: 'In Deutschland in sehr vielen Prüfsituationen sichtbar gefordert.' },
              { term: 'Vorfahrt', note: 'Nicht nur Regeln kennen, sondern aktiv anwenden und notfalls warten.' },
              { term: 'Gefahrenbremsung', note: 'Sofort bremsen, Fahrzeug stabil halten, danach vor erneutem Anfahren absichern.' },
              { term: 'Rundum-Blick', note: 'Vor jedem Rückwärtsfahren und vor jedem Herausfahren den Raum um das Auto aktiv sichern.' },
              { term: 'Rettungsgasse', note: 'Auf Autobahnen und Außerortsstraßen mit mehreren Spuren Pflicht bei stockendem Verkehr.' }
            ],
            examinerCommands: [
              { command: 'Fahren Sie bitte rechts ran.', note: 'Ruhig geeignete Stelle suchen, Spiegel, blinken, Schulterblick, dann anhalten.' },
              { command: 'An der nächsten Kreuzung bitte links.', note: 'Frühzeitig einordnen und Verkehrsraum links/rechts/vorne beobachten.' },
              { command: 'Wir folgen der abknickenden Vorfahrtstraße.', note: 'Blinken und beobachten – Vorrangregeln gegenüber Abbiegern beachten.' },
              { command: 'Fahren Sie in Richtung Autobahn.', note: 'Ausschilderung beachten, rechtzeitig einordnen und Abbiege-Routine (Spiegel, Blinken, Schulterblick).' },
              { command: 'Wir machen jetzt eine Gefahrenbremsung.', note: 'Sofort auf das Kommando reagieren, nicht vorher Schulterblick machen.' },
              { command: 'Bitte zeigen Sie mir die Warnblinkanlage.', note: 'Im Technikteil ruhig zeigen und kurz erklären, statt auswendig aufzusagen.' }
            ],
            trafficSigns: {
              greenArrow: {
                title: 'Grünpfeilschild',
                description: 'Kleines Blechschild neben der roten Ampel. Nur nach vollständigem Halt an der Haltlinie erlaubt. Danach vorsichtig vortasten und absolut allem Verkehr Vorrang gewähren.'
              },
              greenArrowSignal: {
                title: 'Grüner Pfeil als Lichtsignal',
                description: 'Leuchtender Pfeil in der Ampelanlage. Kein zusätzlicher Halt nötig; er gibt die Fahrtrichtung geschützt frei.'
              }
            },
            guidedPoints: {
              laneChange: [
                { title: 'Feste Reihenfolge', content: 'Innenspiegel → Außenspiegel → Blinker → Schulterblick → Spurwechsel.' },
                { title: 'Seitlichen Abstand einschätzen', content: 'Prüfen Sie, ob Motorrad, Fahrrad oder schneller Pkw im toten Winkel auftauchen könnten.' },
                { title: 'Spurwechsel nicht erzwingen', content: 'Wenn die Lücke zu klein ist, bleiben Sie ruhig auf Ihrer Spur und versuchen es später erneut.' }
              ],
              rightBeforeLeft: [
                { title: 'Früh vom Gas', content: 'Bei unübersichtlichen Kreuzungen frühzeitig Geschwindigkeit abbauen und bremsbereit bleiben.' },
                { title: 'Rechts aktiv suchen', content: 'Der Prüfungsfehler ist oft nicht die Regel selbst, sondern dass der Blick nach rechts zu spät kommt.' },
                { title: '§ 10 StVO verstehen – nicht nur den Bordstein', content: 'Rechts-vor-links gilt nicht für Fahrzeuge, die aus Grundstücken, Fußgängerzonen, verkehrsberuhigten Bereichen, Feld-/Waldwegen oder über einen abgesenkten Bordstein auf die Fahrbahn einfahren. Diese müssen allen anderen Vorrang gewähren.' }
              ],
              roundabout: [
                { title: 'Vor dem Einfahren Zeichen prüfen', content: 'Achten Sie vor dem Kreisverkehr auf Zeichen 205 und 215. Mit beiden Schildern hat der Verkehr IM Kreisverkehr Vorfahrt.' },
                { title: 'Beim Einfahren nicht blinken', content: 'Beim Einfahren in den Kreisverkehr wird in Deutschland grundsätzlich nicht geblinkt.' },
                { title: 'Ausfahrt rechtzeitig ankündigen', content: 'Nach der Ausfahrt davor rechts blinken und gleichzeitig Fußgänger sowie Radfahrer an der Ausfahrt prüfen.' },
                { title: 'Blickführung im Kreisverkehr', content: 'Blick in Einfahrtsbereich, dann in den Kreisel, dann zur nächsten Ausfahrt. Geschwindigkeit ruhig und gleichmäßig halten.' }
              ],
              zebra: [
                { title: 'Früh erkennen und bremsbereit werden', content: 'Vor Zebrastreifen rechtzeitig Tempo reduzieren und den Bereich links und rechts aktiv absuchen.' },
                { title: 'Vorrang für Fußgänger', content: 'Schon erkennbar querungsbereite Fußgänger haben Vorrang – nicht erst, wenn sie mitten auf dem Streifen stehen.' },
                { title: 'Radfahrer und verdeckte Personen beachten', content: 'Besondere Vorsicht bei Kindern, E-Scootern, parkenden Autos und Bushaltestellen nahe am Zebrastreifen.' }
              ],
              rightTurn: [
                { title: 'Früh rechts einordnen', content: 'Ordnen Sie sich rechtzeitig möglichst weit rechts ein, ohne Radfahrstreifen zu blockieren.' },
                { title: 'Blick auf Fußgänger und Radfahrer', content: 'Vor dem Einlenken müssen querende Fußgänger und parallel fahrende Radfahrer kontrolliert werden.' },
                { title: 'Nicht zu eng und nicht zu schnell', content: 'Fahren Sie kontrolliert in die rechte Fahrbahnhälfte der Zielstraße ein und bleiben Sie jederzeit anhaltebereit.' }
              ],
              parking: [
                { title: 'Erst Verkehrsraum sichern, dann rangieren', content: 'Vor jedem Rückwärtsfahren den Bereich rund um das Auto aktiv sichern. In der Prüfung ist die sichtbare Rundumbeobachtung wichtiger als Perfektion beim Einlenken.' },
                { title: 'Schulterblick passend zur Bewegungsrichtung', content: 'Vor dem Rückwärts-Einlenken in die Lücke ist vor allem der rechte Schulterblick wichtig. Vor jeder Vorwärtskorrektur muss die Fahrbahnseite mit linkem Schulterblick abgesichert werden.' },
                { title: 'Langsam und korrigierbar fahren', content: 'Rangieren Sie sehr langsam, damit Korrekturen möglich bleiben und Ihre Beobachtung sichtbar ist.' },
                { title: 'Parkverbote und Sicht beachten', content: 'Nicht in Halteverbotszonen, vor Einfahrten, zu nah an Kreuzungen oder auf Radwegen anhalten/einparken.' }
              ],
              countryRoad: [
                { title: 'Rechtsfahrgebot', content: 'Besonders in Kurven und an Kuppen strikt rechts fahren.' },
                { title: 'Geschwindigkeit anpassen', content: 'Die zulässigen 100 km/h sind oft zu viel für enge oder Waldstrecken.' },
                { title: 'Überholen nur bei Sicherheit', content: 'Nur überholen, wenn die Strecke weit einsehbar ist und kein Verbot besteht.' }
              ],
              nightDriving: [
                { title: 'Sichtweite = Geschwindigkeit', content: 'Fahren Sie nur so schnell, dass Sie innerhalb der überschaubaren Strecke anhalten können.' },
                { title: 'Abblenden nicht vergessen', content: 'Bei Gegenverkehr oder knappem Hinterherfahren rechtzeitig auf Abblendlicht schalten.' },
                { title: 'Wildgefahr', content: 'In Waldstücken besonders auf den Fahrbahnrand achten (leuchtende Augen).' }
              ],
              examChecklist: [
                { title: 'Die ersten 5 Minuten sind entscheidend', content: 'Ruhiges Anfahren, saubere Spiegelarbeit und frühe Beobachtung geben dem Prüfer sofort ein sicheres Bild.' },
                { title: 'Lieber defensiv als hektisch', content: 'Wenn eine Situation unklar ist, lieber kurz warten als mit Unsicherheit hineinrollen.' },
                { title: 'Fehler abhaken', content: 'Ein kleiner Fehler bedeutet nicht automatisch durchgefallen. Konzentrieren Sie sich sofort auf die nächste Situation.' }
              ],
              vehicleCheck: [
                { title: 'Motorraum ruhig und systematisch erklären', content: 'In der Prüfung reicht meist kein bloßes Zeigen. Benennen Sie Bauteile sauber: Motoröl, Kühlmittel, Scheibenwaschwasser, Batterie, Bremsflüssigkeit – soweit im Fahrzeug sichtbar und zugänglich.' },
                { title: 'Ölstand mit dem Peilstab prüfen', content: 'Fahrzeug auf möglichst ebener Fläche abstellen, Motor aus, kurz warten, Peilstab herausziehen, abwischen, erneut einstecken, wieder herausziehen und den Stand zwischen Min und Max ablesen.' },
                { title: 'Reifen: Profil, Schäden, Luftdruck', content: 'Prüfen Sie Profil, sichtbare Beschädigungen, Fremdkörper und den allgemeinen Zustand. Gesetzlich sind mindestens 1,6 mm vorgeschrieben, sicherheitsrelevant empfohlen sind deutlich mehr.' },
                { title: 'Beleuchtung vollständig prüfen', content: 'Abblendlicht, Fernlicht, Blinker, Warnblinkanlage, Bremslicht, Rücklicht, Rückfahrlicht, Kennzeichenbeleuchtung und – soweit vorhanden – Nebelschlussleuchte kennen und erklären können.' },
                { title: 'Warnleuchten im Cockpit einordnen', content: 'Grün/Blau bedeutet meist Funktion aktiv, Gelb warnt, Rot bedeutet: sofort aufmerksam werden und je nach Symbol anhalten bzw. nicht weiterfahren.' },
                { title: 'Bremsen, Lenkung und Sichtfelder erklären', content: 'Prüfer fragen oft nicht nur nach Flüssigkeiten. Auch Reifenalter, Scheibenwischer, freie Sicht, Hupe, Feststellbremse und die Wirkung der Fußbremse können Thema sein.' },
                { title: 'Warndreieck, Warnweste und Verbandskasten kennen', content: 'Typische Prüfungsfrage: Wo befinden sich Warndreieck, Warnweste und Verbandskasten? Sie sollten den Ort im Fahrzeug zeigen oder wenigstens plausibel benennen können.' }
              ],
              zipper: [
                { title: 'Bis zum Ende mitfahren', content: 'Nicht schon 100 Meter vorher panisch wechseln. Die endende Spur wird bis kurz vor das Hindernis genutzt.' },
                { title: 'Abwechselnd einfädeln', content: 'Ein Fahrzeug aus der weiterführenden Spur, dann ein Fahrzeug aus der endenden Spur – wie ein Reißverschluss.' }
              ],
              trafficCalmed: [
                { title: 'Schrittgeschwindigkeit einhalten', content: 'In verkehrsberuhigten Bereichen (Spielstraße) gilt: Schrittgeschwindigkeit (ca. 4-7 km/h), nicht schneller.' },
                { title: 'In die Kreuzungstasche einrollen – OHNE Rechtsblinker', content: 'Wenn Sie die T-Kreuzung erreichen, lenken Sie leicht nach rechts in den Einmündungsbereich, um Platz zu schaffen. Rechts vor Links beachten! Benutzen Sie dabei KEINEN rechten Blinker.' },
                { title: 'Fahrzeug von rechts ausfahren lassen', content: 'Bleiben Sie ruhig in Ihrer Ausweichposition und ermöglichen Sie dem Fahrzeug von rechts, links abzubiegen.' },
                { title: 'Zweite Engstelle mit Blinker links vorbereiten', content: 'Sobald das Fahrzeug von rechts passiert hat, schauen Sie nach vorne auf weitere Hindernisse.' },
                { title: 'Gegenverkehr durchlassen, dann sauber vorbeifahren', content: 'Da das zweite parkende Fahrzeug auf Ihrer Seite steht, hat der Gegenverkehr Vorrang.' }
              ],
              bus: [
                { title: 'Warnblinker am Bus ernst nehmen', content: 'Wenn ein Linienbus an der Haltestelle Warnblinker eingeschaltet hat, darf nur mit Schrittgeschwindigkeit vorbeigefahren werden.' },
                { title: 'Auch Gegenverkehr betroffen', content: 'Die Vorsicht gilt je nach Situation auch für Fahrzeuge in der Gegenrichtung. Kinder können jederzeit auftauchen.' }
              ],
              stoppingParking: [
                { title: '3-Minuten-Regel kennen', content: 'Wer länger als drei Minuten hält oder das Fahrzeug verlässt, parkt im rechtlichen Sinn.' },
                { title: 'Zeichen und Bordsteinbereiche lesen', content: 'Absolutes Halteverbot, eingeschränktes Halteverbot, Bushaltestellen, Kreuzungsnähe und Einfahrten sauber unterscheiden.' }
              ],
              properties: [
                { title: 'Allen Vorrang gewähren', content: 'Beim Einfahren auf die Straße aus Grundstücken, Parkflächen, Tankstellen oder verkehrsberuhigten Bereichen gilt § 10 StVO: andere nicht gefährden und allen Vorrang gewähren.' },
                { title: 'Blinken und Schulterblick nicht vergessen', content: 'Auch beim Herausfahren gilt: Beobachten, Absicht klar anzeigen und unmittelbar vor der seitlichen Bewegung den Schulterblick zeigen.' }
              ],
              railway: [
                { title: 'Andreaskreuz ernst nehmen', content: 'Am Andreaskreuz hat der Schienenverkehr Vorrang. Niemals dicht auffahren oder auf den Gleisen anhalten.' },
                { title: 'Blink- oder Schrankenanlage beachten', content: 'Bei rotem Blinklicht oder sich senkender Schranke ist vor dem Übergang anzuhalten. Nicht überholen und keine Eile.' }
              ],
              emergency: [
                { title: 'Ruhe bewahren und Platz schaffen', content: 'Früh erkennen, wohin Sie sicher ausweichen können. Nach rechts orientieren, ggf. anhalten, aber niemals Schutzwege oder Gleise blockieren.' }
              ],
              cyclists: [
                { title: 'Mindestabstand einhalten', content: 'Innerorts mindestens 1,5 m, außerorts mindestens 2,0 m Seitenabstand. Reicht der Platz nicht, wird nicht überholt.' }
              ],
              motorway: [
                { title: 'Rettungsgasse sofort bilden', content: 'Sobald der Verkehr stockt, bilden Sie die Gasse – nicht erst, wenn das Blaulicht sichtbar ist.' },
                { title: 'Am Ende des Beschleunigungsstreifens nicht unnötig bremsen', content: 'Auf dem Beschleunigungsstreifen aktiv beschleunigen, Lücke suchen und entschlossen einfädeln. Bremsen am Ende ist ein häufiger Prüfungsfehler.' }
              ],
              hazards: [
                { title: 'Nicht nur Regeln, sondern Hinweise lesen', content: 'Ball auf der Fahrbahn, Eiswagen, geöffnete Lieferwagenschiebetür oder suchender Blick eines Radfahrers sind Warnzeichen für die nächste Gefahr.' },
                { title: 'Geschwindigkeit proaktiv anpassen', content: 'Defensives Fahren heißt: lieber früh entschärfen als später hart reagieren.' }
              ],
              exit: [
                { title: 'Rechtzeitig einordnen', content: 'Vor dem Abbiegen oder Autobahnausfahrten frühzeitig die Spur wechseln. Zögern führt oft zu gefährlichen Manövern.' },
                { title: 'Geschwindigkeit erst auf dem Verzögerungsstreifen senken', content: 'Nicht schon auf der Autobahn bremsen, sondern erst auf dem Ausfahrtstreifen die Verzögerung einleiten.' }
              ],
              fail: [
                { title: 'Vorfahrt missachtet', content: 'Das Übersehen eines "Vorfahrt gewähren"-Schildes oder eines Fahrzeugs von rechts ist der häufigste Grund für ein sofortiges Ende.' },
                { title: 'Schulterblick vergessen', content: 'Besonders beim Abbiegen oder Spurwechsel ist der fehlende Schulterblick ein k.o.-Kriterium.' },
                { title: 'Rote Ampel oder Stoppschild', content: 'Überfahren einer roten Ampel oder nicht vollständiges Anhalten am Stoppschild.' }
              ]
            },
            quizzes: {
              basics: [
                {
                  id: 'quiz-seat',
                  question: 'Wie prüfen Sie die richtige Entfernung zum Lenkrad?',
                  options: [
                    { id: 'a', text: 'Arme voll durchgestreckt' },
                    { id: 'b', text: 'Handgelenke liegen bei gestreckten Armen oben auf dem Lenkradkranz auf' },
                    { id: 'c', text: 'Oberkörper so nah wie möglich am Lenkrad' }
                  ],
                  explanation: 'Die Handgelenke sollten bei gestreckten Armen oben auf dem Kranz liegen, damit die Arme beim Greifen in der 9-und-3-Uhr-Stellung leicht gebeugt sind.'
                }
              ],
              mirror: [
                {
                  id: 'quiz-sb',
                  question: 'Wann ist ein Schulterblick in Deutschland zwingend erforderlich?',
                  options: [
                    { id: 'a', text: 'Nur beim Rückwärtsfahren' },
                    { id: 'b', text: 'Vor jedem Abbiegen, Fahrstreifenwechsel und beim Anfahren' },
                    { id: 'c', text: 'Gar nicht, wenn die Spiegel groß sind' }
                  ],
                  explanation: 'Der Schulterblick sichert den "Toten Winkel" ab, den Spiegel nicht erfassen können.'
                }
              ],
              tech: [
                {
                  id: 'quiz-oil',
                  question: 'Wie prüfen Sie den Motorölstand korrekt?',
                  options: [
                    { id: 'a', text: 'Bei laufendem Motor' },
                    { id: 'b', text: 'Auf ebener Fläche, Motor aus, kurz warten, Peilstab nutzen' },
                    { id: 'c', text: 'Nur wenn die Warnleuchte brennt' }
                  ],
                  explanation: 'Für eine genaue Messung muss das Öl in die Wanne zurücklaufen und das Fahrzeug gerade stehen.'
                }
              ],
              maneuver: [
                {
                  id: 'quiz-park-1',
                  question: 'Wie viele Korrekturzüge sind beim Einparken in der Prüfung erlaubt?',
                  options: [
                    { id: 'a', text: 'Maximal 2' },
                    { id: 'b', text: 'Beliebig viele' },
                    { id: 'c', text: 'Keine' }
                  ],
                  explanation: 'In der praktischen Prüfung sind pro Grundfahraufgabe maximal 2 Korrekturzüge zulässig.'
                }
              ],
              emergencyBrake: [
                {
                  id: 'quiz-eb-1',
                  question: 'Was ist bei der Gefahrenbremsung im Schaltwagen entscheidend?',
                  options: [
                    { id: 'a', text: 'Sanft bremsen' },
                    { id: 'b', text: 'Kupplung und Bremse schlagartig gleichzeitig voll durchtreten' },
                    { id: 'c', text: 'Erst Schulterblick machen' }
                  ],
                  explanation: 'Sofortige maximale Verzögerung ist das Ziel. Der Fahrlehrer sichert nach hinten ab.'
                }
              ],
              city: [
                {
                  id: 'quiz-rvl',
                  question: 'Wo gilt die Regel "Rechts vor Links"?',
                  options: [
                    { id: 'a', text: 'An allen Kreuzungen' },
                    { id: 'b', text: 'An Kreuzungen ohne vorfahrtregelnde Verkehrszeichen oder Ampeln' },
                    { id: 'c', text: 'Nur in Sackgassen' }
                  ],
                  explanation: 'Rechts vor Links (§ 8 StVO) gilt immer dann, wenn keine andere Regelung (Schilder, Ampeln, Polizei) vorhanden ist.'
                },
                {
                  id: 'quiz-roundabout',
                  question: 'Wann müssen Sie im Kreisverkehr (Zeichen 215) blinken?',
                  options: [
                    { id: 'a', text: 'Beim Einfahren' },
                    { id: 'b', text: 'Beim Ausfahren' },
                    { id: 'c', text: 'Beides' }
                  ],
                  explanation: 'In Deutschland wird beim Einfahren in den Kreisel NICHT geblinkt. Erst beim Verlassen ist das Blinken nach rechts Pflicht.'
                }
              ]
            },
            scenarios: [
              {
                id: 'left-turn-unprotected-green',
                title: 'Ungeschütztes Linksabbiegen bei Grün',
                situation: 'Sie haben ein normales grünes Licht, aber der Gegenverkehr ebenfalls. Das ist die klassische Kreuzung mit ungeschütztem Linksabbiegen.',
                steps: [
                  { title: 'Spiegel, Blinker, Einordnen', description: 'Innen- und Außenspiegel prüfen, links blinken und sauber zur Mitte hin einordnen.', icon: 'AlignCenter' },
                  { title: 'Mit geraden Rädern zur Kreuzungsmitte rollen', description: 'Fahren Sie vorsichtig bis zur Kreuzungsmitte vor und halten Sie die Räder gerade, damit Sie bei einem Auffahrunfall nicht in den Gegenverkehr geschoben werden.', icon: 'ArrowUp' },
                  { title: 'Gegenverkehr durchlassen', description: 'Alle entgegenkommenden Geradeausfahrer und Rechtsabbieger zuerst fahren lassen.', icon: 'AlertTriangle', critical: true },
                  { title: 'Fußgänger und Radfahrer prüfen', description: 'Bevor Sie einlenken, querende Fußgänger und Radfahrer auf der Zielstraße kontrollieren.', icon: 'Eye', critical: true },
                  { title: 'Ruhig in die Zielspur abbiegen', description: 'Mit ruhiger Lenkbewegung in die richtige Fahrbahnhälfte der neuen Straße einfahren.', icon: 'CornerDownRight' }
                ],
                mistakes: [
                  { title: 'Zu früh diagonal schneiden', content: 'Nicht zu früh ziehen. Das gefährdet den Gegenverkehr und führt oft zur falschen Spurwahl.' },
                  { title: 'Räder eingeschlagen stehen lassen', content: 'Wenn Sie in der Kreuzung warten, Räder gerade halten - sonst werden Sie bei einem Heckaufprall in den Gegenverkehr geschoben.' }
                ]
              },
              {
                id: 'left-turn-protected-arrow',
                title: 'Geschütztes Linksabbiegen mit Grünpfeilampel',
                situation: 'Sie haben einen grünen Linksabbiegepfeil. Gegenverkehr und querende Fußgänger haben normalerweise Rot.',
                steps: [
                  { title: 'Kreuzungsbereich trotzdem prüfen', description: 'Auch beim geschützten Pfeil kurz kontrollieren, ob niemand unerwartet in den Kreuzungsbereich läuft oder fährt.', icon: 'Eye' },
                  { title: 'Ohne Zwischenstopp abbiegen', description: 'Sie dürfen die Kurve direkt durchfahren und müssen nicht erst in der Kreuzungsmitte warten.', icon: 'CornerDownRight' },
                  { title: 'Spur sauber halten', description: 'Trotz Vorfahrt exakt in der passenden Zielspur landen und nicht unnötig weit ziehen.', icon: 'AlignCenter' }
                ]
              },
              {
                id: 'left-turn-one-way-from',
                title: 'Linksabbiegen aus Einbahnstraße',
                situation: 'Sie fahren in einer Einbahnstraße und wollen links abbiegen.',
                steps: [
                  { title: 'Möglichst weit links einordnen', description: 'Vor dem Abbiegen möglichst weit links einordnen, sofern Markierungen nichts anderes vorgeben.', icon: 'AlignCenter' },
                  { title: 'Linken toten Winkel prüfen', description: 'Besonders auf Radfahrer, E-Scooter oder andere Überholer achten.', icon: 'Eye', critical: true },
                  { title: 'Nicht aus der Straßenmitte abbiegen', description: 'Ein Linksabbiegen aus der Mitte oder rechten Seite der Einbahnstraße ist in der Prüfung ein schwerer Fehler.', icon: 'AlertTriangle', critical: true },
                  { title: 'Sauber in Zielspur einfahren', description: 'Nicht zu weit ausholen und direkt in die richtige Fahrbahnhälfte der Zielstraße fahren.', icon: 'CornerDownRight' }
                ]
              },
              {
                id: 'left-turn-tangential',
                title: 'Tangentiales Linksabbiegen',
                situation: 'Sie und das entgegenkommende Fahrzeug wollen beide links abbiegen. Der Regelfall in Deutschland ist das tangentiale Voreinanderabbiegen.',
                steps: [
                  { title: 'Kreuzungsmitte sauber anfahren', description: 'Nicht früh diagonal schneiden, sondern kontrolliert in den Kreuzungsbereich vorrollen.', icon: 'ArrowUp' },
                  { title: 'Regelfall: voreinander abbiegen', description: 'Im Regelfall biegen beide Linksabbieger tangential voreinander ab. Dadurch bleiben die Wege kurz, klar und konfliktarm.', icon: 'CornerDownRight', critical: true },
                  { title: 'Ausnahme erkennen', description: 'Wenn die Fahrbahnmarkierungen, versetzte Fahrstreifen oder die konkrete Verkehrslage das Voreinanderabbiegen nicht zulassen, kann ausnahmsweise hintereinander abgebogen werden.', icon: 'Info' },
                  { title: 'Zielspur sauber treffen', description: 'Unabhängig von der Methode am Ende in der richtigen Fahrbahnhälfte der Zielstraße landen.', icon: 'AlignCenter' }
                ],
                mistakes: [
                  { title: 'Den Regelfall nicht kennen', content: 'Viele Prüflinge zögern, obwohl in der Standardsituation tangential voreinander abgebogen werden soll.' },
                  { title: 'Ausnahme trotz Markierungen übersehen', content: 'Wenn die Kreuzungsgeometrie oder Markierungen eine andere Führung verlangen, muss diese erkannt und übernommen werden.' }
                ]
              },
              {
                id: 'rvl-hidden-right',
                title: 'Verdeckte Rechts-vor-Links-Einmündung',
                situation: 'In engen Wohngebieten oder 30er-Zonen sind Einmündungen von rechts oft durch parkende Autos oder Hecken verdeckt. Wer hier zu schnell fährt, riskiert eine Vorfahrtsverletzung.',
                steps: [
                  { title: 'Annähern mit reduzierter Geschwindigkeit', description: 'Frühzeitig den Fuß vom Gas nehmen und bremsbereit sein.', icon: 'ArrowDown' },
                  { title: 'Aktives Hineinschauen nach rechts', description: 'Den Blick deutlich nach rechts wenden, auch wenn die Einmündung noch verdeckt scheint.', icon: 'Eye', critical: true },
                  { title: 'Vorfahrt gewähren', description: 'Bei Fahrzeugen von rechts anhalten und sie passieren lassen.', icon: 'AlertTriangle', critical: true }
                ]
              },
              {
                id: 'left-turn-one-way-into',
                title: 'Linksabbiegen in Einbahnstraße',
                situation: 'Sie biegen links in eine Einbahnstraße ein. Dort gibt es keinen Gegenverkehr, aber die Spurwahl bleibt wichtig.',
                steps: [
                  { title: 'Einfahrt beobachten', description: 'Vergewissern Sie sich anhand von Beschilderung und Markierung, dass die Zielstraße tatsächlich Einbahnstraße ist.', icon: 'Info' },
                  { title: 'Rechtsfahrgebot beachten', description: 'Auch ohne Gegenverkehr nicht links kleben, sondern in die passende rechte Spur beziehungsweise rechte Fahrbahnhälfte einfahren.', icon: 'AlignCenter', critical: true },
                  { title: 'Nach Radverkehr und Fußgängern schauen', description: 'Vor allem an der Einmündung auf querende oder parallel fahrende Verkehrsteilnehmer achten.', icon: 'Eye' }
                ]
              },
              {
                id: 'left-turn-multi-lane',
                title: 'Mehrspuriges paralleles Linksabbiegen',
                situation: 'Zwei oder mehr Spuren biegen gleichzeitig links ab. Leitlinien sind vorhanden.',
                steps: [
                  { title: 'Eigene Spur eindeutig wählen', description: 'Schon vor der Kreuzung korrekt einordnen und die passende Abbiegespur nutzen.', icon: 'AlignCenter' },
                  { title: 'Leitlinien folgen', description: 'Beim Abbiegen exakt den gestrichelten Leitlinien folgen.', icon: 'ArrowUp' },
                  { title: 'Spur halten - nicht driften', description: 'Innen nicht zu weit nach außen treiben und außen nicht die Kurve schneiden.', icon: 'AlertTriangle', critical: true }
                ]
              },
              {
                id: 'left-turn-right-before-left',
                title: 'Linksabbiegen an unmarkierter Rechts-vor-Links-Kreuzung',
                situation: 'Keine Schilder, keine Ampeln - nur eine ruhige Wohngebietskreuzung. Sie möchten links abbiegen.',
                steps: [
                  { title: 'Frühzeitig abbremsen', description: 'An unübersichtlichen Kreuzungen langsam heranfahren und bremsbereit bleiben.', icon: 'Circle' },
                  { title: 'Fahrzeuge von rechts beachten', description: 'Fahrzeuge von rechts haben Vorrang - auch wenn Sie links abbiegen wollen.', icon: 'Shield', critical: true },
                  { title: 'Auch Gegenverkehr durchlassen', description: 'Zusätzlich müssen Sie den Gegenverkehr durchlassen, der geradeaus fährt.', icon: 'AlertTriangle', critical: true },
                  { title: 'Erst dann links abbiegen', description: 'Sie stehen in dieser Situation fast ganz unten in der Vorrangordnung - fahren Sie nur, wenn wirklich alles frei ist.', icon: 'CornerDownRight' }
                ]
              },
              {
                id: 'left-turn-bending-priority-follow',
                title: 'Abknickende Vorfahrt nach links folgen',
                situation: 'Die dicke schwarze Linie auf dem Vorfahrtzeichen knickt nach links ab und Sie wollen der Vorfahrtstraße folgen.',
                steps: [
                  { title: 'Vorfahrtzeichen früh erkennen', description: 'Rechtzeitig erkennen, wohin die bevorrechtigte Straße führt.', icon: 'Info' },
                  { title: 'Links blinken', description: 'Auch wenn Sie auf der Hauptstraße bleiben: Weil Ihr Fahrzeug nach links lenkt, müssen Sie links blinken.', icon: 'ArrowLeft', critical: true },
                  { title: 'Nebenrichtungen beobachten', description: 'Trotz Vorfahrt aufmerksam auf wartepflichtige Fahrzeuge und Fußgänger achten.', icon: 'Eye' }
                ]
              },
              {
                id: 'left-turn-bending-priority-leave',
                title: 'Abknickende Vorfahrt verlassen',
                situation: 'Die Hauptstraße knickt links ab, Sie wollen aber geradeaus weiterfahren oder scheinbar leicht nach rechts aus der Vorfahrt heraus.',
                steps: [
                  { title: 'Verkehr auf der Vorfahrtstraße erkennen', description: 'Fahrzeuge, die der Hauptstraße nach links folgen, bleiben bevorrechtigt.', icon: 'Shield' },
                  { title: 'Nicht falsch links blinken', description: 'Wenn Sie die Vorfahrtstraße verlassen, dürfen Sie nicht so tun, als würden Sie ihr nach links folgen.', icon: 'AlertTriangle', critical: true },
                  { title: 'Bevorrechtigte Fahrzeuge durchlassen', description: 'Warten Sie, wenn nötig, auf Fahrzeuge, die der Hauptstraße links folgen.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'left-turn-tram',
                title: 'Linksabbiegen an Straßenbahngleisen',
                situation: 'Sie wollen links über Straßenbahngleise abbiegen und eine Straßenbahn nähert sich.',
                steps: [
                  { title: 'Straßenbahn früh erkennen', description: 'Schon beim Annähern prüfen, ob eine Straßenbahn kommt oder aus einer Haltestelle anfährt.', icon: 'Search' },
                  { title: 'Vor den Gleisen warten', description: 'Wenn eine Straßenbahn naht, vor den Gleisen anhalten und sie zuerst passieren lassen.', icon: 'Square', critical: true },
                  { title: 'Nicht auf Zeit spekulieren', description: 'Straßenbahnen sind lang, schwer und können oft nicht ausweichen - nicht knapp davor links abbiegen.', icon: 'AlertTriangle', critical: true },
                  { title: 'Erst danach den Turn abschließen', description: 'Nach dem Passieren der Bahn erneut rundum prüfen und erst dann sicher links abbiegen.', icon: 'CornerDownRight' }
                ]
              },
              {
                id: 'rb-standard-entry',
                title: 'Standard-Kreisel mit Vorfahrt im Kreis',
                situation: 'Sie nähern sich einem Kreisverkehr mit Zeichen 205 und 215 und wollen die zweite Ausfahrt nehmen.',
                steps: [
                  { title: 'Früh Geschwindigkeit reduzieren', description: 'Nehmen Sie vor der Einfahrt deutlich Tempo raus und machen Sie sich bremsbereit.', icon: 'Circle' },
                  { title: 'Links in den Kreisel prüfen', description: 'Achten Sie auf Fahrzeuge, die bereits im Kreisverkehr fahren.', icon: 'Eye', critical: true },
                  { title: 'Ohne Blinken einfahren', description: 'Fahren Sie ein, sobald frei ist. Beim Einfahren nicht blinken.', icon: 'ArrowRight', critical: true },
                  { title: 'Vor der gewünschten Ausfahrt rechts blinken', description: 'Nach Passieren der ersten Ausfahrt rechts blinken und an Fußgänger/Radfahrer denken.', icon: 'CheckCircle' }
                ],
                mistakes: [
                  { title: 'Zu früh blinken', content: 'Blinken beim Einfahren ist ein klassischer Prüfungsfehler.' }
                ]
              },
              {
                id: 'rb-no-signs',
                title: 'Kleiner Kreisel ohne Beschilderung',
                situation: 'Sie kommen an einen kleinen Kreisverkehr ohne Zeichen 205/215.',
                steps: [
                  { title: 'Situation neu bewerten', description: 'Ohne die üblichen Schilder gilt nicht automatisch Vorfahrt im Kreis.', icon: 'Info' },
                  { title: 'Rechts-vor-Links beachten', description: 'Prüfen Sie genau, wer von rechts kommt und ob Sie warten müssen.', icon: 'Shield', critical: true }
                ]
              },
              {
                id: 'zebra-child-waiting',
                title: 'Kind wartet am Zebrastreifen',
                situation: 'Ein Kind steht am Bordstein in der Nähe des Zebrastreifens und schaut zur Fahrbahn.',
                steps: [
                  { title: 'Tempo deutlich senken', description: 'Nehmen Sie früh Tempo heraus, um jederzeit anhalten zu können.', icon: 'Circle' },
                  { title: 'Bremsbereit bleiben', description: 'Kinder sind schwer berechenbar und können plötzlich loslaufen.', icon: 'AlertTriangle', critical: true },
                  { title: 'Anhalten und Vorrang gewähren', description: 'Sobald erkennbar ist, dass das Kind queren will, halten Sie vor dem Streifen an.', icon: 'CheckCircle', critical: true }
                ]
              },
              {
                id: 'zebra-hidden-pedestrian',
                title: 'Verdeckter Fußgänger hinter Lieferwagen',
                situation: 'Ein Lieferwagen verdeckt die Sicht auf den Zebrastreifen.',
                steps: [
                  { title: 'Sichtbehinderung ernst nehmen', description: 'Fahren Sie langsam genug, um sofort anhalten zu können.', icon: 'Eye', critical: true },
                  { title: 'Bereich links und rechts prüfen', description: 'Rechnen Sie mit Personen, die plötzlich hinter dem Fahrzeug hervortreten.', icon: 'Search' }
                ]
              },
              {
                id: 'rt-bike-lane',
                title: 'Rechtsabbiegen mit Radfahrer neben Ihnen',
                situation: 'Sie möchten rechts abbiegen, rechts neben Ihrem Fahrzeug befindet sich ein Radfahrer.',
                steps: [
                  { title: 'Früh blinken und einordnen', description: 'Rechts blinken und Ihre Position so wählen, dass Ihre Absicht klar erkennbar ist.', icon: 'ArrowRight' },
                  { title: 'Spiegel + Schulterblick rechts', description: 'Kontrollieren Sie den Bereich rechts hinten unmittelbar vor dem Abbiegen.', icon: 'Eye', critical: true },
                  { title: 'Radfahrer durchlassen', description: 'Wenn der Radfahrer Vorrang hat oder weiter geradeaus fährt, warten Sie.', icon: 'AlertTriangle', critical: true }
                ]
              },
              {
                id: 'rt-pedestrian-green',
                title: 'Rechtsabbiegen bei Grün mit Fußgängern',
                situation: 'Sie haben grün, aber Fußgänger queren die Zielstraße.',
                steps: [
                  { title: 'Grün bedeutet nicht freie Fahrt', description: 'Auch bei grüner Ampel müssen Sie querenden Fußgängern Vorrang gewähren.', icon: 'Info' },
                  { title: 'Vor dem Einlenken stoppen, wenn nötig', description: 'Bleiben Sie ruhig stehen, bis die Querung frei ist.', icon: 'CheckCircle', critical: true }
                ]
              },
              {
                id: 'park-tight-space',
                title: 'Enge Lücke beim Parallelparken',
                situation: 'Die Parklücke ist knapp, aber noch realistisch prüfbar.',
                steps: [
                  { title: 'Lücke bewusst bewerten', description: 'Entscheiden Sie ruhig, ob die Lücke geeignet ist. Im Zweifel lieber weiterfahren als hektisch scheitern.', icon: 'Search' },
                  { title: 'Beobachtung sichtbar zeigen', description: 'Vor dem Rückwärtsfahren deutlich Spiegel und Schulterblick durchführen.', icon: 'Eye', critical: true },
                  { title: 'Notfalls korrigieren', description: 'Eine saubere Korrektur ist besser als einmal falsch hineinzuzwingen.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'park-no-stopping-zone',
                title: 'Freie Lücke im Halteverbot',
                situation: 'Sie sehen eine freie Lücke, dort steht aber ein absolutes Halteverbot.',
                steps: [
                  { title: 'Verkehrszeichen priorisieren', description: 'Auch wenn die Lücke perfekt aussieht, dürfen Sie dort nicht anhalten.', icon: 'Slash', critical: true },
                  { title: 'Alternative suchen', description: 'Fahren Sie ruhig weiter und nennen Sie dem Prüfer den Grund.', icon: 'Navigation' }
                ]
              },
              {
                id: 'hwy-strong-acceleration',
                title: 'Zügiges Auffahren auf die Autobahn',
                situation: 'Sie befinden sich auf dem Beschleunigungsstreifen.',
                steps: [
                  { title: 'Abstand zum Vordermann', description: 'Lassen Sie genug Platz, um selbst beschleunigen zu können.', icon: 'ArrowUp' },
                  { title: 'Blinker links und Vollgas', description: 'Nutzen Sie den Streifen zum Beschleunigen auf Autobahntempo.', icon: 'Zap', critical: true },
                  { title: 'Spiegel und Schulterblick', description: 'Prüfen Sie die linke Spur und fädeln Sie flüssig ein.', icon: 'Eye', critical: true }
                ]
              },
              {
                id: 'hwy-missed-exit',
                title: 'Ausfahrt auf der Autobahn verpasst',
                situation: 'Sie haben Ihre geplante Ausfahrt gerade verpasst.',
                steps: [
                  { title: 'Niemals anhalten oder wenden', description: 'Auf der Autobahn ist das Anhalten oder Rückwärtsfahren lebensgefährlich.', icon: 'AlertTriangle', critical: true },
                  { title: 'Weiterfahren bis zur nächsten Ausfahrt', description: 'Bleiben Sie ruhig und nehmen Sie einfach die nächste reguläre Ausfahrt.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'country-forest-area',
                title: 'Waldstrecke mit Wildwechsel-Gefahr',
                situation: 'Sie fahren auf einer Landstraße durch ein Waldstück.',
                steps: [
                  { title: 'Geschwindigkeit anpassen', description: 'Fahren Sie besonders in der Dämmerung vorsichtiger.', icon: 'Circle' },
                  { title: 'Fahrbahnrand beobachten', description: 'Achten Sie auf leuchtende Augen oder Bewegungen im Gebüsch.', icon: 'Search' },
                  { title: 'Fernlicht bei Gegenverkehr abblenden', description: 'Blenden Sie rechtzeitig ab, um andere nicht zu gefährden.', icon: 'Eye' }
                ]
              },
              {
                id: 'country-narrow-curve',
                title: 'Unübersichtliche Kurve auf der Landstraße',
                situation: 'Vor Ihnen liegt eine enge, nicht einsehbare Rechtskurve.',
                steps: [
                  { title: 'Tempo vor der Kurve drosseln', description: 'Bremsen Sie rechtzeitig ab, bevor Sie in die Kurve einfahren.', icon: 'Circle' },
                  { title: 'Rechtsfahrgebot strikt einhalten', description: 'Bleiben Sie weit rechts, falls Gegenverkehr die Kurve schneidet.', icon: 'ArrowRight', critical: true }
                ]
              },
              {
                id: 'vc-engine-hood',
                title: 'Öffnen der Motorhaube',
                situation: 'Der Prüfer bittet Sie, die Motorhaube zu öffnen.',
                steps: [
                  { title: 'Entriegelung im Innenraum', description: 'Ziehen Sie den Hebel (meist links unten beim Fahrer), um die Haube zu entriegeln.', icon: 'Settings' },
                  { title: 'Sicherung vorn lösen', description: 'Greifen Sie unter die leicht geöffnete Haube und betätigen Sie den Sicherungshaken.', icon: 'CheckCircle', critical: true },
                  { title: 'Haube sicher fixieren', description: 'Haube mit dem Stab sichern oder prüfen, ob sie von Gasdruckfedern gehalten wird.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'vc-tire-check',
                title: 'Prüfen der Bereifung',
                situation: 'Prüfen Sie den Zustand der Reifen.',
                steps: [
                  { title: 'Profiltiefe (Min. 1,6 mm)', description: 'Prüfen Sie das Profil (Tipp: 1,6 mm ist Gesetz, 3-4 mm wird empfohlen).', icon: 'Settings' },
                  { title: 'Beschädigungen suchen', description: 'Achten Sie auf Risse, Beulen oder Fremdkörper im Reifen.', icon: 'Eye', critical: true },
                  { title: 'Luftdruck erwähnen', description: 'Nennen Sie, dass der Druck regelmäßig im kalten Zustand geprüft werden muss.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'city-lane-change-dense',
                title: 'Spurwechsel im dichten Verkehr',
                situation: 'Viel Verkehr, kleine Lücken. Sie müssen die Spur wechseln, um abzubiegen.',
                steps: [
                  { title: 'Frühzeitig blinken', description: 'Geben Sie anderen Verkehrsteilnehmern Zeit, Ihre Absicht zu erkennen.', icon: 'ArrowLeft' },
                  { title: 'Geschwindigkeit anpassen', description: 'Versuchen Sie, die Geschwindigkeit der Zielspur zu erreichen.', icon: 'Activity' },
                  { title: 'Schulterblick!', description: 'Unmittelbar vor dem Wechsel den toten Winkel prüfen.', icon: 'Eye', critical: true },
                  { title: 'Zügig rüberziehen', description: 'Nutzen Sie die Lücke entschlossen, sobald sie groß genug ist.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'hwy-short-ramp',
                title: 'Kurzer Beschleunigungsstreifen',
                situation: 'Die Auffahrt ist extrem kurz. Sie müssen schnell auf Autobahntempo kommen.',
                steps: [
                  { title: 'Schon in der Kurve Gas geben', description: 'Nutzen Sie jede Möglichkeit, um frühzeitig Tempo aufzubauen.', icon: 'Zap' },
                  { title: 'Frühzeitig beobachten', description: 'Schon vor dem Streifen den Verkehr auf der Autobahn scannen.', icon: 'Search', critical: true },
                  { title: 'Volle Beschleunigung', description: 'Nutzen Sie den gesamten Streifen, um das Tempo anzupassen.', icon: 'ArrowUp', critical: true }
                ]
              },
              {
                id: 'hwy-truck-right-lane',
                title: 'Lkw auf der rechten Spur',
                situation: 'Ein Lkw fährt rechts. Sie müssen entscheiden: davor oder dahinter einfädeln?',
                steps: [
                  { title: 'Geschwindigkeit des Lkw schätzen', description: 'Fährt der Lkw langsam oder mit Tempomat 80?', icon: 'Search' },
                  { title: 'Lücke wählen', description: 'Entscheiden Sie sich frühzeitig für "vor" oder "hinter" den Lkw.', icon: 'CheckCircle', critical: true },
                  { title: 'Abstand halten', description: 'Nach dem Einfädeln sofort den Sicherheitsabstand prüfen.', icon: 'AlertTriangle' }
                ]
              }
            ],
            vehicleCheckVisuals: [
              {
                id: 'visual-dipstick',
                code: 'CHECK',
                title: 'Ölmessstab / Peilstab',
                description: 'Motorölstand zwischen Min und Max prüfen. Messung auf möglichst ebener Fläche und bei abgestelltem Motor erklären.'
              },
              {
                id: 'visual-tyre',
                code: '1.6 MM',
                title: 'Reifenprofil',
                description: 'Gesetzliches Mindestprofil: 1,6 mm. In der Prüfung zusätzlich Zustand, Beschädigungen und Luftdruck erwähnen.'
              },
              {
                id: 'visual-dashboard',
                code: 'ROT / GELB',
                title: 'Warnleuchten',
                description: 'Grün/Blau = aktiv, Gelb = Warnung, Rot = sofort reagieren. Prüfer fragen oft nach Bedeutung und Verhalten.'
              },
              {
                id: 'visual-lights',
                code: 'LIGHTS',
                title: 'Beleuchtungscheck',
                description: 'Abblendlicht, Blinker, Bremslicht, Warnblinker und Nebelschlussleuchte kennen und ihre Prüfung erklären können.'
              }
            ],
            vehicleCheckScenarios: [
              {
                id: 'vehicle-check-oil-dipstick',
                title: 'Prüfer fragt: „Zeigen Sie mir, wie Sie den Ölstand prüfen.“',
                situation: 'Sie stehen am Fahrzeug und sollen den Ölstand fachlich korrekt erklären und zeigen.',
                steps: [
                  { title: 'Haube öffnen und sichern', description: 'Entriegelung im Innenraum betätigen, Sicherheitshebel unter der Haube lösen und die Haube sicher öffnen bzw. mit Stütze sichern.' },
                  { title: 'Peilstab nennen und herausziehen', description: 'Den Ölmessstab lokalisieren, vollständig herausziehen und mit einem Tuch abwischen.' },
                  { title: 'Erneut einstecken und ablesen', description: 'Peilstab ganz einstecken, wieder herausziehen und prüfen, ob der Stand zwischen Minimum und Maximum liegt.' },
                  { title: 'Richtig erklären', description: 'Zusätzlich sagen: Zu wenig Öl schadet dem Motor, zu viel Öl ist ebenfalls problematisch. Gegebenenfalls passendes Motoröl nach Herstellervorgabe nachfüllen.' }
                ],
                mistakes: [
                  { id: 'oil-mistake-1', title: 'Nur auf den Behälter zeigen', content: 'Der Prüfer erwartet meist eine kurze Erklärung des Ablaufs, nicht nur ein stummes Zeigen.' }
                ]
              },
              {
                id: 'vehicle-check-tyres',
                title: 'Prüfer fragt nach Reifenprofil und Zustand',
                situation: 'Sie sollen erklären, worauf man am Reifen achtet und welches Mindestprofil vorgeschrieben ist.',
                steps: [
                  { title: 'Profil benennen', description: 'Erklären Sie: Gesetzlich mindestens 1,6 mm Profil. Für Sicherheit bei Nässe sind deutlich mehr sinnvoll.' },
                  { title: 'Auf Schäden achten', description: 'Prüfen auf Risse, Beulen, eingefahrene Gegenstände und ungleichmäßigen Abrieb.' },
                  { title: 'Luftdruck erwähnen', description: 'Luftdruck muss zur Beladung und Herstellerangabe passen. Zu niedriger oder zu hoher Druck verschlechtert Fahrverhalten und Bremsweg.' }
                ]
              },
              {
                id: 'vehicle-check-dashboard',
                title: 'Prüfer fragt nach Warnleuchten im Cockpit',
                situation: 'Sie sitzen im Fahrzeug und sollen typische Kontroll- und Warnleuchten erklären.',
                steps: [
                  { title: 'Farben richtig deuten', description: 'Grün/Blau = Funktion aktiv, Gelb = Warnhinweis, Rot = akutes Problem bzw. sofortige Reaktion nötig.' },
                  { title: 'Beispiele nennen', description: 'Zum Beispiel: Blinker, Fernlicht, Motorkontrollleuchte, Öldruck, Batterie, ABS, Bremssystem, Airbag.' },
                  { title: 'Rote Leuchten ernst nehmen', description: 'Erklären Sie, dass man bei roten Warnleuchten die Situation prüfen und je nach Symbol nicht einfach weiterfahren darf.' }
                ]
              },
              {
                id: 'vehicle-check-lights',
                title: 'Prüfer fragt: „Wie prüfen Sie die Beleuchtung?“',
                situation: 'Sie sollen beschreiben, wie Sie die Beleuchtung kontrollieren – auch wenn Sie allein sind.',
                steps: [
                  { title: 'Bedienelemente kennen', description: 'Zeigen Sie, wo Lichtschalter, Nebelschlussleuchte, Warnblinker und ggf. Leuchtweitenregulierung bedient werden.' },
                  { title: 'Außenkontrolle erklären', description: 'Abblendlicht, Blinker, Bremslicht und Rücklicht kann man mit Helfer oder durch Spiegelung an einer Wand/Schaufenster kontrollieren.' },
                  { title: 'Saubere Leuchten erwähnen', description: 'Leuchten müssen nicht nur funktionieren, sondern auch sauber und nicht beschädigt sein.' }
                ]
              },
              {
                id: 'vehicle-check-safety-equipment',
                title: 'Prüfer fragt nach Warndreieck und Verbandskasten',
                situation: 'Sie sollen Sicherheitsausrüstung im Fahrzeug benennen und zeigen.',
                steps: [
                  { title: 'Ort benennen', description: 'Nennen oder zeigen Sie den Aufbewahrungsort von Warndreieck, Warnwesten und Verbandskasten.' },
                  { title: 'Zweck erklären', description: 'Erklären Sie kurz, wofür die Gegenstände gedacht sind und dass sie im Notfall schnell erreichbar sein sollten.' },
                  { title: 'Ruhe bewahren', description: 'Wenn Ihr Fahrschulauto die Gegenstände an ungewöhnlicher Stelle hat, ruhig nachdenken und systematisch suchen statt hektisch zu raten.' }
                ]
              }
            ],
    },
  },
  en: {
    common: {
      home: 'Home',
      features: 'Features',
      successStories: 'Success Stories',
      about: 'About',
      backToDashboard: 'Back to Dashboard',
      startNow: 'Start Now',
      getStartedFree: 'Get Started Free',
      watchDemo: 'Watch Demo',
      language: 'Language',
      selectGoal: 'Select your Goal',
      startPersonalized: 'Start personalized to your specific path',
      startHere: 'Start here',
      cancel: 'Cancel',
      save: 'Save',
      pause: 'Pause',
      replay: 'Replay',
      ok: 'OK',
      problem: 'Problem!',
      resume: 'Resume',
      stopAndSave: 'Stop & Save',
      total: 'Total',
      cost: 'Cost',
      edit: 'Edit',
      delete: 'Delete',
      saveChanges: 'SAVE CHANGES',
      saveSession: 'SAVE SESSION',
      date: 'Date',
      notes: 'Notes',
      name: 'Name',
      search: 'SEARCH',
      loading: 'Loading...',
      close: 'Close',
      next: 'Next',
      continue: 'Continue',
      appSubtitle: 'Driving School App',
      paths: {
        umschreibung: 'Conversion',
        fahrschule: 'Training',
      },
      transmissions: {
        manual: 'Manual',
        automatic: 'Automatic',
      },
      tuvDekra: 'TÜV / DEKRA',
      gdprCompliant: 'GDPR Compliant',
      allRightsReserved: 'All rights reserved.',
      proDriverTech: 'Professional Driver Training Technology.',
      nav: {
        home: 'Home',
        curriculum: 'Plan',
        maneuvers: 'Moves',
        achievements: 'Achievements',
        review: 'Review',
        tracker: 'Log',
        finance: 'Finance',
        account: 'Account',
        mainNav: 'Main Navigation',
        mobileNav: 'Mobile Navigation',
        languageSelect: 'Language Selection',
        signOut: 'Sign Out',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode'
      }
    },
    quiz: {
      greatJob: 'Great Job!',
      keepPracticing: 'Keep Practicing!',
      resultsSummary: (score: number, total: number) => `You got ${score} out of ${total} correct`,
      retry: 'Retry',
      done: 'Done',
      nextQuestion: 'Next',
      showResults: 'Show Results',
      nextQuestionAria: 'Next question',
      showResultsAria: 'Show results',
      restartAria: 'Restart quiz',
      closeAria: 'Close quiz and return to dashboard',
      closeX: 'Close quiz',
    },
    welcome: {
      hero: {
        badge: 'Recommended by Experts 2026',
        titlePrefix: 'The fastest way to your',
        titleHighlight: 'German Driving License',
        subtitle: 'Test readiness with AI Coaching, interactive maneuvers, and a smart digital driving log.',
        happyStudents: 'Happy Students',
        passRate: 'Pass Rate',
        firstAttempt: 'First Attempt',
      },
      features: {
        title: 'Smart Features',
        subtitle: 'Everything you need to pass your exam on the first attempt.',
        aiCoaching: {
          title: 'AI Coaching',
          desc: 'Get real-time feedback on your driving style and spot mistakes before they become costly.',
        },
        maneuverReplay: {
          title: 'Maneuver Replay',
          desc: 'Review your parking and highway maneuvers in a smooth 3D-style preview.',
        },
        instructorSync: {
          title: 'Instructor Sync',
          desc: 'Share your progress directly with your instructor for more focused driving lessons.',
        },
      },
      success: {
        title: 'Student Success',
        stories: [
          { name: 'Lukas S.', role: 'Just Passed', text: 'Thanks to the AI analysis, I knew exactly what to look out for during the exam. 10/10!' },
          { name: 'Sarah M.', role: 'Conversion', text: 'The conversion path was so easy. The digital logbook saved me so much time.' },
          { name: 'Marc K.', role: 'Theory & Practical', text: 'Best app on the market. The maneuver simulations are worth their weight in gold!' },
        ]
      },
      about: {
        title: 'About DriveDE',
        text: 'Our mission is to digitize driver education in Germany. We combine cutting-edge AI technology with decades of expertise to get you on the road safer and faster.',
        tags: ['Engineering in Berlin', 'Expert Data', 'Privacy First'],
      },
      paths: {
        manual: { title: 'New License (Manual)', desc: 'The classic way for Class B' },
        automatic: { title: 'New License (Automatic)', desc: 'Modern, stress-free B197 path' },
        umschreibungManual: { title: 'Conversion (Manual)', desc: 'Convert existing foreign license' },
        umschreibungAutomatic: { title: 'Conversion (Automatic)', desc: 'Easy conversion, no clutch tension' },
      },

    },
    account: {
      title: 'Account & Profile',
      guestMode: 'Guest mode active',
      guestDesc: 'You can use the app without an account, or sign in to enable cloud sync later.',
      signOut: 'Sign out',
      manageAccount: 'Manage account',
      shareWithInstructor: 'Share report with instructor',
      openingGoogle: 'Opening Google …',
      continueWithGoogle: 'Continue with Google',
      signInEmail: 'Sign in with email',
      continueGuest: 'Continue as guest',
      guestNote: 'Google and email are optional. You can also use the app entirely in guest mode.',
      learningPath: 'Learning path',
      progress: 'Progress',
      lessons: 'lessons',
      drivingTime: 'driving time',
      notSelectedYet: 'Not selected yet',
      profileSettings: 'Profile settings',
      darkMode: 'Dark mode',
      active: 'Enabled',
      disabled: 'Disabled',
      on: 'On',
      off: 'Off',
      languageActive: 'English active',
      changePath: 'Change learning path',
      changePathDesc: 'Re-select manual, automatic, or conversion path',
      viewLanding: 'View landing page',
      viewLandingDesc: 'Show the introductory page with all info',
      resetProgress: 'Reset progress',
      resetProgressDesc: 'Clear local learning progress and tracker entries',
      developerTools: 'Developer Tools',
      enableDemo: 'Enable Demo Mode',
      enableDemoDesc: 'Fill app with sample data for video recording',
      privacyLegal: 'Privacy & legal',
      privacyLegalDesc: 'Review GDPR, terms, imprint, and legal notices',
      instructorReview: 'Instructor review',
      instructorReviewDesc: 'Open the PDF, sample lessons, and review pack',
      shareModal: {
        title: 'Instructor Sync',
        desc: 'Your instructor can scan this code to review your current progress and driving logs.',
        directLink: 'Direct Link',
        copyLink: 'Copy link',
        linkCopied: 'Link copied!',
      },
      errors: {
        googleNotConfigured: 'Google login becomes available once Supabase is configured for this project.',
        googleFail: 'Could not start Google sign-in.',
        shareSignIn: 'Please sign in first to share your report.',
        userNotFound: 'User ID could not be found.',
      }
    },
    budget: {
      title: 'Finances',
      costMonitor: 'Cost Monitor',
      spentSoFar: 'Spent So Far',
      totalGoal: 'Total Goal',
      unlockEstimation: 'UNLOCK ESTIMATION',
      nextSteps: 'Next Steps',
      estLessonsRemaining: 'Est. lessons remaining',
      normalLessons: 'Normal Lessons',
      specialDrives: 'Special Drives',
      remaining: 'Remaining',
      yetToBeInvested: 'Yet to be invested',
      externalFeesNote: 'Excl. external costs like TÜV fees (~€200).',
      strategyTitle: 'DriveDE Strategy',
      adjustRates: 'Adjust Rates',
      hourlyRate: 'Hourly Rate (45 Min)',
      registrationFee: 'Registration Fee',
      theoryExam: 'Theory Exam',
      practicalExam: 'Practical Exam',
      materials: 'Materials',
      firstAid: 'First Aid',
      negativeError: 'Values cannot be negative',
      unlockPro: 'UNLOCK PRO',
      savingsPossible: 'Maximum savings possible!',
      efficiencyDetected: 'Efficiency potential detected',
      highReadinessAdvice: 'Your readiness is peak. Finish special drives quickly to avoid extra practice lessons.',
      lowReadinessAdvice: (rate: number) => `Focus on theory & simulation. Every lesson you save through prep puts €${rate} back in your pocket.`,
      optimizationAvailable: 'Strategic optimization available',
      upgradeProAdvice: 'Upgrade to Pro to see your personal financial strategy and savings tips.',
    },
    tracker: {
      title: 'Driving Log',
      subtitle: 'Track your driving lessons',
      liveRouteTrace: 'Live Route Trace',
      startPoint: 'Start Point',
      endPoint: 'End Point',
      yourDestination: 'Your Destination',
      stopSignAhead: 'Stop Sign Ahead!',
      sessionUpdated: 'Session updated',
      sessionSaved: 'Session saved',
      enterDurationError: 'Please enter duration',
      deleteConfirm: 'Are you sure you want to delete this session?',
      sessionDeleted: 'Session deleted',
      wrongWayAlert: '⛔ Wrong Way! Stop immediately!',
      pedestrianZone: 'Pedestrian Zone',
      privateAccess: 'Private Access',
      entryForbidden: 'Illegal Turn / Entry',
      illegalTurn: '⛔ Illegal Turn!',
      rightBeforeLeftAlert: '👉 Watch Right-Before-Left! (Too fast)',
      schoolZoneCaution: '🏫 Caution: School Zone / Playground! (Max 30 recommended)',
      destinationFound: 'Destination found!',
      destinationNotFound: 'Destination not found',
      searchFailed: 'Search failed',
      invalidAmountError: 'Please enter a valid amount',
      rateUpdated: 'Rate updated!',
      gpsDenied: 'Location access denied. Please enable GPS in settings.',
      gpsError: 'GPS error. Please check your connection.',
      rapidAccelAlert: 'Rapid acceleration detected!',
      aggressiveCorneringAlert: '🏎️ High G-Force: Aggressive Cornering!',
      harshBrakingAlert: 'Harsh braking detected!',
      stopSignViolation: 'Stop Sign Violation!',
      speedingAlert: (limit: number) => `Speeding! (Limit: ${limit})`,
      ecoStopEngine: 'Eco: Stop Engine!',
      motionSensorDenied: 'Motion sensor access denied',
      simulationLooping: 'Simulation looping...',
      simulationStarted: 'Drive timer & sensors started!',
      sensorsStarted: 'Sensors & Tracking started!',
      timerPaused: 'Timer paused',
      timerResumed: 'Timer resumed',
      readyToSave: 'Ready to save!',
      mistakeAddedManually: 'Mistake added manually',
      simulateButton: 'Simulate',
      drivingSchoolRate: 'Driving School Rate',
      manualLogTitle: 'Log Manual Mistake',
      liveTimerTitle: 'Live Drive Timer',
      simulationMode: 'Demo Mode',
      confirmSimulate: 'Do you want to add a simulated drive with Leaflet Map and mistake data?',
      safetyScore: 'Safety Score',
      distance: 'Dist.',
      speed: 'Speed',
      limit: 'Limit',
      liveTrackingActive: 'Live tracking active (Basic mode)',
      startLive: 'Start Live',
      trackingPro: 'Live Tracking PRO',
      regularDrive: 'Practice Drive',
      conversionOverview: 'Conversion Overview',
      noMandatorySpecialDrives: 'No legal mandatory special drives required',
      conversionNote: 'For license conversions, the instructor decides the number of required practice hours.',
      requiredSpecialDrives: 'Required Special Drives',
      specialDrivesNote: 'Special drives can only start after basic training is completed.',
      entries: 'entries',
      noSessionsTitle: 'No sessions yet',
      noSessionsMessage: 'Start live tracking or manually log a past driving lesson.',
      logFirstSession: 'Log first session',
      simulated: 'Simulated',
      safetyBalance: 'Safety Balance',
      ecoFriendly: 'Eco Friendly',
      notesLabel: 'NOTES',
      routeMapAvailable: 'Route map available',
      routeMapUpgradeNote: 'Upgrade to PRO to see your driven route on the map.',
      unlockPro: 'Unlock PRO',
      faultAnalysis: 'Fault Analysis',
      occurrences: 'occurrences',
      faultAnalysisUpgradeNote: 'PRO shows you exactly where and when mistakes happened.',
      seeDetails: 'See details',
      noCriticalMistakes: 'No critical mistakes',
      safeDriveMessage: 'Excellent drive! Keep up this focus.',
      editSession: 'Edit',
      deleteSession: 'Delete',
      clearHistory: 'Clear History',
      confirmClearHistory: 'Are you sure you want to permanently clear all driving history?',
      addSessionTitle: 'Add Session',
      editSessionTitle: 'Edit Session',
      dateLabel: 'Date',
      driveTypeLabel: 'Drive Type',
      durationLabel: 'Duration (Minutes)',
      distanceLabel: 'Distance (km)',
      instructorLabel: 'Instructor (Name)',
      locationLabel: 'Location / Route',
      locationPlaceholder: 'e.g. Berlin, Mitte',
      notesPlaceholder: 'What went well? What needs practice?',
      destinationPlaceholder: 'Destination (e.g. Berlin Hbf)',
      radar: {
        reaction: 'Reaction',
        priority: 'Priority',
        scan: 'Scan',
        roundabout: 'Roundabout',
        mastered: 'Mastered',
        practice: 'Practice',
      },
      mistakes: {
        speeding: 'Speeding',
        harshBraking: 'Harsh Braking',
        rapidAcceleration: 'Rapid Acceleration',
        shoulderCheck: 'Missed Shoulder Check',
        signal: 'Missed Signal',
        priority: 'Priority Violation',
        stopSign: 'Stop Sign Violation',
        wrongWay: '⛔ Wrong Way Driving',
        illegalTurn: '⛔ Illegal Turn / Entry',
        roundaboutSignal: '🔄 Roundabout: Signal',
        curveSpeeding: '⚠️ Speed in Curve',
        aggressiveCornering: '🏎️ Aggressive Cornering',
        rightBeforeLeft: '👉 Right-Before-Left',
        schoolZone: '🏫 School Zone',
        other: 'Other Mistake',
        idling: 'Engine Idling',
      },
      types: {
        normal: 'Practice Drive',
        ueberland: 'Overland',
        autobahn: 'Highway',
        nacht: 'Night',
      }
    },
    dashboard: {
      examReadiness: 'Exam Readiness',
      examChance: 'Exam Chance',
      examScore: 'Exam Score',
      combinedScore: 'Combined Lessons & Quiz Score',
      unlockPro: 'Unlock all premium features',
      examSimulation: 'Exam Simulation',
      simulationDesc: 'Real exam questions and time pressure',
      drivingHours: 'Driving Hours',
      chapters: 'Chapters',
      streak: 'Streak',
      conversionQuickstart: 'Conversion Quick Start',
      germanyFocus: 'Germany Focus',
      jumpToTraps: 'Jump directly to the "German traps" in the exam.',
      learningProgress: 'Your Learning Progress',
      changePath: 'Change learning path',
      accountSettings: 'Account Settings',
      continueLearning: 'Continue Learning',
      viewAll: 'View All',
      proTip: 'Exam Pro Tip',
      tips: {
        conversion: 'The shoulder check is vital. Execute it clearly and visibly.',
        regular: 'Shoulder check is the most common mistake! Practice it with every lane change.',
      },
      cloudSyncActive: 'Cloud sync active',
      signInForSync: 'Sign in for Cloud Sync',
      precisionPrep: 'Precision Driving Prep',
      pills: {
        greenArrow: 'Green Arrow',
        shoulderCheck: 'Shoulder Check',
        priority: 'Right-before-left',
        instantFail: 'Instant fail',
      },
      maneuvers: 'Maneuvers',
      animations: 'Animations',
      maneuversDesc: 'Basic maneuvers like parking and turning.',
      tech: 'Vehicle Tech',
      exam: 'Exam',
      techDesc: 'Tires, lights, and check indicators.',
      reviewPack: 'Instructor Review Pack',
      pdfExport: 'PDF Export',
      reviewDesc: 'Export curriculum and progress to share with your instructor.',
      practiceCheck: 'Practice Check',
      specialDrives: 'Special Drives',
      focusThemes: 'Required Areas',
      mandatoryHours: 'Mandatory Hours',
      conversionChecks: [
        { title: 'Shoulder check', text: 'Always perform.' },
        { title: 'Right-of-way', text: 'Right-before-left.' },
        { title: 'Routine', text: 'Calm driving.' },
      ],
      specialDriveTypes: {
        ueberland: 'Country',
        autobahn: 'Highway',
        nacht: 'Night',
      },
      hoursSuffix: 'hrs',
      manualPath: {
        title: 'Class B - Manual',
        subtitle: 'With clutch & gear stick',
      },
      automaticPath: {
        title: 'Class B197 - Automatic',
        subtitle: 'Automatic transmission',
      },
      conversionPath: {
        title: 'License Conversion',
        subtitleManual: 'With manual exam car and focus on German rules',
        subtitleAuto: 'With automatic exam car and focus on German rules',
      }
    },
    licenseSelector: {
      title: 'Welcome to DriveDE',
      subtitle: 'First choose your learning path and then the transmission',
      pathTitle: '1. Select Learning Path',
      transmissionTitle: '2. Select Transmission',
      standard: {
        title: 'New License',
        subtitle: 'Normal driving school training',
        description: 'For students who are taking the German driver\'s license for the first time.',
        features: [
          'Complete learning path from basics to exam readiness',
          'Maneuvers, city traffic, special trips and technical questions',
          'Step-by-step instructions with exam focus',
          'Driving lesson tracker and special trips overview',
        ],
      },
      conversion: {
        title: 'Conversion',
        subtitle: 'Convert a foreign driver\'s license',
        description: 'For people with an existing license from abroad who are preparing for the practical exam in Germany.',
        features: [
          'Germany quick start with exam traps',
          'Green arrow, right-before-left exceptions & play street',
          'Examiner commands in German + English',
          'Immediate failure reasons & shoulder check requirements',
        ],
      },
      manual: {
        title: 'Manual',
        subtitle: 'Clutch & Gearbox',
        description: 'Shows shifting and clutch content, manual emergency braking and transmission-relevant tips.',
      },
      automatic: {
        title: 'Automatic',
        subtitle: 'No Clutch',
        description: 'Shows automatic-only content, automatic emergency braking and simplified vehicle operation.',
      },
      conversionNote: 'For conversion, the exam can take place on manual or automatic. Therefore, you must also select a transmission there.',
      standardNote: 'In normal training, the transmission selection controls which lessons on clutching, shifting and emergency braking are visible.',
      continue: 'Start App',
      selectPath: 'Select Path',
      selectTransmission: 'Select Transmission',
      selected: 'Selected',
      choosePathFirst: 'Please select a learning path first.',
      switchToEnglish: 'Switch to English',
      switchToGerman: 'Switch to German',
    },
    curriculum: {
      title: 'Curriculum',
      licensePath: 'License Path',
      changeLicense: 'Change License Class',
      manual: 'Manual Transmission',
      manualDesc: 'Class B - Clutch & Shifting',
      automatic: 'Automatic',
      automaticDesc: 'Class B197 - No Clutch',
      conversionManual: 'Conversion · Manual',
      conversionManualDesc: 'No mandatory hours, but with manual transmission',
      conversionAutomatic: 'Conversion · Automatic',
      conversionAutomaticDesc: 'No mandatory hours, automatic-only content',
      umschreibungManual: 'Conversion · Manual',
      umschreibungAutomatic: 'Conversion · Automatic',
      classBManual: 'Class B (Manual)',
      classB197Automatic: 'Class B197 (Automatic)',
      manualBadge: 'Manual',
      autoBadge: 'Auto',
      interactiveBadge: 'Interactive',
      pathDescUmschreibung: 'Focused Germany path for license conversion: German exam traps, right-of-way rules, shoulder checks, and examiner commands.',
      pathDescStandard: 'Complete learning path from basics through maneuvers to the practical exam.',
      noLessonsTitle: 'No Lessons',
      noLessonsMessage: 'No lessons are available for this learning path yet. Check back soon!',
      moneyBackTitle: 'Money-Back Guarantee',
      moneyBackDesc: 'If you don\'t pass your exam',
      quiz: 'Quiz',
      correct: 'Correct!',
      incorrect: 'Incorrect!',
      completeLesson: 'Complete Lesson',
      interactiveSimulator: 'Interactive Simulator',
      masterSituation: 'Master the situation to complete the lesson',
      lessonCompleted: 'Lesson Successfully Completed!',
      solveSimulatorHint: '💡 Solve the simulator above to proceed',
      shoulderScan: 'Practical Check: Shoulder Scan',
      scanningSequence: 'Practice the life-saving scanning sequence',
      scanningTrained: 'Scanning sequence trained correctly!',
      roundaboutCheck: 'Practical Check: Roundabout',
      signalingRules: 'Master signaling rules in the circle',
      roundaboutCompleted: 'Roundabout successfully completed!',
      emergencyBrakeCheck: 'Practical Check: Emergency Brake',
      reactionTimeTraining: 'Train reaction time & full emergency brake',
      parkingCheck: 'Practical Check: Parking',
      parallelParkingStep: 'Parallel parking step by step',
      vehicleCheck: 'Interactive Vehicle Check',
      techKnowledge: 'Check your technical knowledge of the vehicle',
      examSimulation: 'Full Final Check: Exam Simulation',
      expertFeedback: '15-minute live simulation with expert feedback',
      animationHide: 'Hide Animation',
      animationWatch: '🎬 Watch Animation',
      step: 'Step',
      critical: 'Critical!',
      goToQuiz: 'Go to Quiz',
      complete: 'Complete',
      nextStep: 'Next Step',
      allSteps: 'All Steps',
      keyTerms: 'Key Terms',
      glossarySub: 'German and English for lessons and exam situations',
      typicalExaminer: 'Typical Examiner Commands',
      examinerSub: 'Understand the original wording and act on it calmly',
      importantSigns: 'Important Traffic Signs',
      signsSub: 'Signs often relevant in this situation',
      guidedPoints: 'Guided Learning Points',
      guidedPointsSub: 'Exam-relevant observation and action points',
      typicalScenarios: 'Typical Driving Scenarios',
      scenarioSub: 'Step-by-step guidance for tricky practical situations',
      trafficLights: 'Traffic lights',
      laneShape: 'Lanes & road shape',
      specialRules: 'Special rules',
      scenarioStep: 'Step',
      commonMistakes: 'Common mistakes in this scenario',
      instructorTips: 'Instructor Tips',
      markAsLearned: 'Mark as Learned',
    },
    legal: {
      privacy: 'Privacy Policy',
      terms: 'Terms & Conditions',
      gdpr: 'GDPR & Data Rights',
      impressum: 'Imprint',
      disclaimer: 'Disclaimer',
      sections: {
        controller: '1. Controller',
        processedData: '2. What data is processed',
        purpose: '3. Purpose of processing',
        storage: '4. Storage and recipients',
        legalBases: '5. Legal bases',
        scope: '1. Scope',
        noSubstitute: '2. No substitute for instructors or official sources',
        useOfContent: '3. Use of content',
        availability: '4. Availability and changes',
        limitation: '5. Limitation of liability',
        yourRights: 'Your GDPR Rights',
        howToExercise: 'How to exercise your rights',
        complaint: 'Right to lodge a complaint',
        provider: 'Provider identification',
        contact: 'Contact',
        notice: 'Notice',
        safety: 'Important Safety Notice',
        noGuarantee: 'No guarantee of passing or completeness',
        sources: 'Controlling Sources',
      },
      placeholders: {
        controller: 'Before launch, replace these placeholder details with your real company data: DriveDE, Musterstraße 1, 10115 Berlin, Email: privacy@drivede.app.',
        imprint: 'Before publication, replace these placeholder details fully with the real operator details. Example: DriveDE GmbH, Musterstraße 1, 10115 Berlin, Germany.',
        notice: 'Depending on your legal entity and business activity, additional mandatory disclosures may be required, such as commercial register details, VAT ID, authorized representative, or professional information. Please have this reviewed legally.',
        launchReady: 'These contents are a launch-ready starting template. Before publishing, please review and replace all placeholders, company details, and legal specifics.',
      },
      hub: {
        title: 'Legal & Privacy',
        desc: 'This page bundles the key legal information needed for beta or launch operation in Germany and the EU. Before publishing, replace placeholders with your real contact and company details.',
        items: {
          privacy: 'How data is processed, stored, and protected',
          terms: 'Rules for usage, liability, and content',
          gdpr: 'Access, deletion, rectification, and data export rights',
          impressum: 'Provider and legal notice information under German law',
          disclaimer: 'Important usage and safety limitations of the app',
        }
      },
      legalContent: {
        privacy: {
          processedData: [
            'App settings such as language, dark mode, learning path, and transmission type',
            'Local learning progress, completed lessons, quiz results, and tracker/logbook data',
            'Optional contact or feedback data when a user actively sends an inquiry'
          ],
          purpose: 'Data is used to provide app functionality, save study progress, improve user experience, and—if enabled later—to synchronize progress across devices.',
          storage: 'In the current beta version, most data is stored locally on the device. If cloud services, analytics, or payment providers are added later, they must be listed here individually.',
          legalBases: [
            'Art. 6(1)(b) GDPR – performance of a contract / app provision',
            'Art. 6(1)(f) GDPR – legitimate interests in secure and stable app operation',
            'Art. 6(1)(a) GDPR – consent, if optional analytics or marketing is enabled'
          ]
        },
        terms: {
          scope: 'These terms govern the use of the DriveDE app. The app is designed to support preparation for practical driving lessons and practical exams in Germany.',
          noSubstitute: 'The app does not replace a driving school, a driving instructor, official legal advice, or official information from authorities, TÜV, or DEKRA. Applicable law and the concrete instructions of the instructor or examiner always prevail.',
          useOfContent: 'Content may only be used for personal, non-transferable learning purposes. Commercial redistribution, systematic copying, or republishing is not permitted without written approval.',
          availability: 'The app may be changed, improved, or have individual features limited over time. There is no claim to permanent availability of any specific content or feature.',
          limitation: 'In cases of slight negligence, liability is limited to breaches of essential contractual obligations. To the extent legally permitted, we are not liable for damage arising from improper application of app content in real road traffic.'
        },
        gdpr: {
          yourRights: [
            'Right of access to personal data processed about you',
            'Right to rectification of inaccurate data',
            'Right to erasure of personal data',
            'Right to restriction of processing',
            'Right to data portability',
            'Right to object to certain processing activities',
            'Right to withdraw consent with effect for the future'
          ],
          howToExercise: 'Send a request to privacy@drivede.app. Before launch, replace this with your real contact details. In the current local app version, many data points can also be removed directly by resetting the app or clearing browser/device storage.',
          complaint: 'You have the right to lodge a complaint with a data protection supervisory authority if you believe your data is processed in violation of the GDPR.'
        },
        disclaimer: {
          safety: 'The app is intended for learning support only. Content must never be used or read while actively driving a vehicle. Use the app only before or after driving, or as a passenger.',
          noGuarantee: 'DriveDE does not guarantee passing a practical exam. Exam expectations may vary by region, vehicle, or examiner. Content is prepared carefully but may still contain errors or simplifications despite review.',
          sources: 'In case of doubt, the current German Road Traffic Regulations (StVO), instructor directions, official exam criteria, and the actual traffic situation on site always prevail.'
        }
      }
    },
    maneuvers: {
      title: 'Basic Maneuvers',
      subtitle: 'Step-by-step guides for the exam',
      noManeuversTitle: 'No Maneuvers',
      noManeuversMessage: 'No special maneuvers are required for this learning path.',
      steps: 'steps',
      start: 'Start',
      importantTips: 'Important Tips',
      check360: '360° check + shoulder check!',
      check360Desc: 'Before every reverse movement use a 360° check; for lane or direction changes show a clear shoulder check',
      driveSlowly: 'Drive Slowly',
      driveSlowlyDesc: 'For maneuvers: Speed = Control',
      correctionsAllowed: 'Corrections Allowed',
      correctionsAllowedDesc: 'Adjusting position is fine in the exam',
      checklistTitle: 'Exam Checklist',
      checklist: [
        '✓ Observe → Signal → Shoulder check → Maneuver',
        '✓ Hold clutch at biting point',
        '✓ Use reference points',
        '✓ Stay calm, take your time',
      ],
      items: {
        'maneuver-1': { title: 'Parallel Parking' },
        'maneuver-2': { title: 'Reverse Parking' },
        'maneuver-3': { title: 'Three-Point Turn' },
        'maneuver-4': { title: 'Emergency Braking' }
      },
      animatedGuides: 'Animated Guides',
      parking: 'Parallel',
      reverse: 'Reverse',
      threePoint: '3-Point',
      emergency: 'Emergency',
      roundabout: 'Roundabout',
      highway: 'Highway',
      animationAria: (label: string, isOpen: boolean) => `${isOpen ? 'Close' : 'Open'} ${label} animation`,
      interactive: {
        parking: {
          title: 'Parallel Parking Simulator',
          complete: 'Complete Lesson',
          startEngine: 'Start Engine',
          stop: 'STOP',
          turnWheel: 'Turn Wheel ↷',
          counterSteer: 'Counter-steer ↶',
          hintStart: 'Drive forward until you are next to the blue car.',
          hintAlign: 'Click "STOP" when your rear axle aligns with the blue car’s rear.',
          hintSteerIn: 'Turn the steering wheel fully to the RIGHT.',
          hintBackIn: 'Reverse until you see the car behind in your left mirror.',
          hintSteerOut: 'Now turn the steering wheel fully to the LEFT.',
          hintFinal: 'Perfectly parked! The distance to the curb is correct.',
          note: 'Important: In the exam, you must always perform an all-around scan when reversing. In the simulator, we focus on the reference points.',
        },
        simulator: {
          checkSurroundings: 'Check surroundings (360° scan)!',
          steerAndReverse: 'Turn wheel & Reverse!',
          counterSteer: 'Counter-steer & Align!',
          shoulderCheckRight: 'Shoulder check RIGHT!',
          shoulderCheckLeft: 'Shoulder check LEFT!',
          fullCheckAndSignalRight: '360° check & signal RIGHT!',
          dangerEmergencyBrake: '🚨 DANGER! EMERGENCY BRAKE! 🚨',
          checkBeforeDrive: 'Check surroundings!',
          signalRightAndShoulder: 'Signal RIGHT & shoulder check!',
          signalLeftAndAccelerate: 'Signal LEFT & accelerate!',
          mirrorAndShoulderLeft: 'Mirror & shoulder check left!',
        },
        priority: {
          title: 'Mini-Simulator: Who goes first?',
          instructions: 'Click on the vehicles in the correct order.',
          error: (label: string) => `Incorrect! Remember "Right before Left". The ${label} has priority.`,
          successTitle: 'Excellent!',
          successMessage: 'You applied the right-of-way rule correctly.',
          continue: 'Continue Lesson',
          didYouKnow: 'Did you know?',
          fact: 'In Germany, at intersections without signs, "Right before Left" always applies. Whoever comes from the right has priority.',
          blueCar: 'Blue Car (from Right)',
          redCar: 'Red Car (from Bottom)',
        },
        techCheck: {
          title: 'Vehicle Tech Check',
          found: 'found',
          instruction: 'Click on the markers in the engine bay to learn more.',
          passed: 'Tech Check Passed!',
          hotspots: {
            oil: { name: 'Oil Dipstick', desc: 'To check the engine oil level. The level must be between MIN and MAX.' },
            coolant: { name: 'Coolant', desc: 'Never open when the engine is hot! Danger of burns.' },
            washer: { name: 'Washer Fluid', desc: 'Blue cap. Important for good visibility, especially in winter with antifreeze.' },
            brake: { name: 'Brake Fluid', desc: 'If the level drops, go to the workshop immediately. Safety system!' },
            battery: { name: 'Battery', desc: 'Check for tight terminals and cleanliness.' }
          }
        },
        roundabout: {
          title: 'Roundabout Master',
          entry: 'Entry',
          inside: 'Inside',
          exit: 'Exit',
          success: 'Great!',
          mastered: 'You mastered the roundabout.',
          signalRight: 'Signal Right',
          driveExit: 'Drive / Exit',
          ruleTitle: 'Key Rule:',
          ruleText: 'Enter without signal, exit with signal! Those inside have the right of way.',
          errorEntry: 'Incorrect! You must NOT signal when entering the roundabout.',
          errorExit: 'Wait! You must signal to indicate you are leaving the roundabout at the next exit.',
        },
        emergencyBrake: {
          title: 'Emergency Braking Training',
          stop: 'STOP!',
          success: 'Perfect Braking!',
          tooSlow: 'Too slow!',
          reactFaster: 'You must react faster.',
          brakeEarly: 'Do not brake too early!',
          tryAgain: 'Try Again',
          startTest: 'Start Test',
          brake: 'BRAKE',
          examTip: 'Exam Tip:',
          standard: 'Reaction time below 700ms is the exam standard.',
          ready: 'Get ready... Press BRAKE as soon as you see the command!',
          tipText: 'In the exam, you must brake "abruptly". The ABS must kick in, and the car must really screech or vibrate!',
        },
        mirrorCheck: {
          title: 'Scanning & Safety Sequence',
          interior: 'Interior',
          shoulder: 'Shoulder Check',
          examReady: 'Exam Ready!',
          ruleTitle: 'The 3-S-Scan:',
          error: (label: string) => `Incorrect! The sequence is critical. Next: ${label}`,
          laneChange: (dir: string) => `${dir === 'left' ? 'Left' : 'Right'} Lane Change/Turn`,
          successText: 'You have mastered the sequence perfectly. This is how you pass every lane change.',
          indicator: 'Set Indicator',
          ruleText: 'First overview (interior mirror), then safety (side mirror), then indicate intention (blinker) and immediately before the change, the shoulder check for the blind spot.',
        },
      },
    },
    exam: {
          title: 'Are you ready for your exam?',
          desc: 'In this 15-minute simulation, you must react quickly and safely to exam questions and traffic situations.',
          start: 'Start Simulation',
          passed: 'Exam Passed!',
          failed: 'Unfortunately Not Passed',
          excellent: 'Excellent! You are ready for the real exam.',
          practice: 'Practice the critical situations again.',
          finish: 'Finish Lesson',
          scenarios: [
            {
              id: 'start',
              situation: 'The examiner enters the car. "Good day. Please prepare yourself for departure."',
              options: [
                { id: 'o1', text: 'Start the engine and drive off immediately.', isCorrect: false, feedback: 'Error! Adjust mirrors and seat first, then buckle up.' },
                { id: 'o2', text: 'Check seat/mirrors, buckle up, start engine.', isCorrect: true, feedback: 'Correct. Safety first.' }
              ]
            },
            {
              id: 'right-of-way',
              situation: 'You approach an intersection without signs (Right before Left). A vehicle is approaching from the right.',
              options: [
                { id: 'o1', text: 'Stop and let the other vehicle pass.', isCorrect: true, feedback: 'Correct. Observed Right before Left.' },
                { id: 'o2', text: 'Continue quickly as you are faster.', isCorrect: false, feedback: 'Failed! Disregarded right-of-way.' }
              ]
            },
            {
              id: 'tempo-30',
              situation: 'You turn into a street and see the "Zone 30" sign. Your speedometer shows 45 km/h.',
              options: [
                { id: 'o1', text: 'Brake immediately to 30 km/h.', isCorrect: true, feedback: 'Correct. Limits must be kept exactly in zones.' },
                { id: 'o2', text: 'Let the car coast until you reach 35 km/h.', isCorrect: false, feedback: 'Error! Too fast in the 30 zone.' }
              ]
            },
            {
              id: 'school-bus',
              situation: 'A school bus stops in front of you with hazard lights on.',
              options: [
                { id: 'o1', text: 'Only pass at walking speed (4-7 km/h) if safe to do so.', isCorrect: true, feedback: 'Correct. Special caution with school buses!' },
                { id: 'o2', text: 'Overtake at normal city speed (50 km/h).', isCorrect: false, feedback: 'Failed! Life-threatening situation for children.' }
              ]
            },
            {
              id: 'zebra-crossing',
              situation: 'A pedestrian is clearly approaching a zebra crossing.',
              options: [
                { id: 'o1', text: 'Stop and let the pedestrian cross.', isCorrect: true, feedback: 'Correct. Pedestrians have priority here.' },
                { id: 'o2', text: 'Honk briefly and continue quickly.', isCorrect: false, feedback: 'Failed! Disregarded priority.' }
              ]
            },
            {
              id: 'cyclist-overtake',
              situation: 'You want to overtake a cyclist within a built-up area.',
              options: [
                { id: 'o1', text: 'Keep at least 1.5 meters lateral distance.', isCorrect: true, feedback: 'Very good. Distance is legally required.' },
                { id: 'o2', text: 'Pass closely so oncoming traffic is not hindered.', isCorrect: false, feedback: 'Failed! Endangering the cyclist.' }
              ]
            },
            {
              id: 'left-turn',
              situation: 'You want to turn left. Oncoming traffic is coming straight ahead.',
              options: [
                { id: 'o1', text: 'Let oncoming traffic pass first.', isCorrect: true, feedback: 'Correct. Left turners must wait.' },
                { id: 'o2', text: 'Turn quickly before oncoming traffic.', isCorrect: false, feedback: 'Failed! Forcing right-of-way is forbidden.' }
              ]
            },
            {
              id: 'stop-sign',
              situation: 'You approach a STOP sign with a stop line.',
              options: [
                { id: 'o1', text: 'Come to a complete standstill at the stop line (3 sec).', isCorrect: true, feedback: 'Correct. "Rolling" counts as failed.' },
                { id: 'o2', text: 'Roll slowly up and continue if clear.', isCorrect: false, feedback: 'Failed! Disregarded stop duty.' }
              ]
            },
            {
              id: 'autobahn-merge',
              situation: 'You are on the acceleration lane of the highway.',
              options: [
                { id: 'o1', text: 'Accelerate strongly and merge with appropriate speed.', isCorrect: true, feedback: 'Correct. Rapid entry is safer.' },
                { id: 'o2', text: 'Stop at the beginning of the lane and wait for a gap.', isCorrect: false, feedback: 'Dangerous! This often leads to rear-end collisions.' }
              ]
            },
            {
              id: 'finish-park',
              situation: 'The examiner says: "Find a parking space and park the vehicle."',
              options: [
                { id: 'o1', text: 'Find gap, signal, secure, park, engine off, secure.', isCorrect: true, feedback: 'Perfect. Congratulations, you passed!' },
                { id: 'o2', text: 'Just park on the sidewalk and jump out.', isCorrect: false, feedback: 'Failed at the last meters!' }
              ]
            }
          ],
    },
    instructor: {
          title: 'Instructor Review',
          print: 'Print',
          downloadPdf: 'Download PDF',
          generating: 'Generating…',
          packTitle: 'Instructor review pack',
          packSubtitle: 'DriveDE – materials for professional review',
          packDesc: 'This package bundles exactly the materials a German driving instructor typically needs for a professional review: curriculum, sample lessons, maneuver instructions, assessment rubric, UX descriptions, and quiz questions.',
          activeSelection: 'Active selection',
          mistakeReview: 'My Mistake Review',
          mistakesWaiting: (count: number) => `${count} scenarios waiting for review.`,
          markAsLearned: 'Mark as learned',
          situation: 'Situation:',
          correctAnswer: 'Correct Answer:',
          shareTitle: 'What you can share with your instructor',
          shareDesc: 'Can be printed directly from the app or saved as a PDF.',
          shareItems: [
            '1. Export this review pack as PDF',
            '2. Send the app link plus 3–5 screenshots',
            '3. Ask for focused feedback on StVO accuracy, didactics, and exam realism',
            '4. Implement changes in priority order 1 → 2 → 3',
          ],
          section1Title: '1. Module list / table of contents',
          section1Desc: 'For evaluating didactic sequencing.',
          section2Title: '2. Full text of 3 sample lessons',
          section2Desc: 'For reviewing StVO accuracy, depth, and structure.',
          section3Title: '3. Maneuver instructions & reference points',
          section3Desc: 'For verifying maneuver steps, observation order, and reference points.',
          section4Title: '4. Review rubric / assessment lens',
          section4Desc: 'To compare the app against real TÜV/DEKRA assessment expectations.',
          section5Title: '5. Screenshots / screen descriptions',
          section5Desc: 'For evaluating UX clarity and pedagogical quality.',
          section6Title: '6. Quiz / test questions',
          section6Desc: 'For verifying legal and technical correctness.',
          pdfTitle: 'DriveDE – Instructor Review Pack',
          pdfActiveSelection: 'Active selection',
          pdfIntro: 'This PDF bundles curriculum, sample lessons, maneuver instructions, assessment rubric, UX descriptions, and quiz questions for professional review by a German driving instructor.',
          pdfSection1: '1. Module list / table of contents',
          pdfSection2: '2. Full text of 3 sample lessons',
          pdfSection3: '3. Maneuver instructions & reference points',
          pdfSection4: '4. Review rubric / assessment lens',
          pdfSection5: '5. Screen descriptions',
          pdfSection6: '6. Quiz / test questions',
          pdfCorrectAnswer: 'Correct answer',
          sampleLesson: 'Sample lesson',
          relevantSigns: 'Relevant signs / visuals',
          guidedPoints: 'Guided learning points',
          stepByStep: 'Step-by-step instructions',
          examScenarios: 'Exam scenarios',
          instructorNotes: 'Instructor / exam notes',
          whatToReview: 'What to review:',
          typicalRisk: 'Typical risk:',
          printError: 'The print view could not be created. Please try again.',
          popupError: 'The print window could not be opened. Please allow pop-ups for this page.',
          pdfError: 'The PDF could not be created. Please try again.',
          licenseTypes: {
            'umschreibung-manual': 'Conversion · Manual',
            'umschreibung-automatic': 'Conversion · Automatic',
            'manual': 'New License · Manual',
            'automatic': 'New License · Automatic'
          },
          paywall: {
            title: 'DriveDE Pro',
            badge: 'UNLOCK PREMIUM',
            subtitle: 'Your shortcut to the license',
            features: [
              'GPS Live Tracking & Fault Analysis',
              'AI Driving Coach & Custom Tips',
              'All Video Lessons & 3D Scenarios',
              'Exclusive PDF Instructor Review',
              'Priority Cloud Sync & Support'
            ],
            cta: 'Unlock Pro Now',
            cancel: 'Maybe later',
            secure: 'Secure Stripe Checkout',
            trust: '2026 TÜV / DEKRA guidelines',
            moneyBack: 'Money-Back Guarantee',
            moneyBackDesc: 'If you don\'t pass your exam',
            recommended: 'RECOMMENDED',
            tiers: {
              '30-days': {
                label: 'Starter',
                description: 'Perfect for a quick start',
                period: 'for 30 days'
              },
              '90-days': {
                label: 'Most Popular',
                description: 'Best exam preparation',
                period: '90 Day Focus'
              },
              'lifetime': {
                label: 'Ultimate',
                description: 'Your companion forever',
                period: 'Lifetime Access'
              }
            }
          },
          drivingInsights: {
            title: 'Weekly Insights',
            activity: 'Weekly Activity',
            last7Days: 'Last 7 Days',
            unlockInsights: 'Unlock Insights',
            focusAreas: 'Focus Areas',
            basedOnHistory: 'Based on your driving history',
            reviewLesson: 'Review Lesson',
            noRecurringFaults: 'Perfect! No recurring faults.',
            aiAnalysisPro: 'AI mistake analysis is available for Pro members.',
            unlockPro: 'UNLOCK PRO',
            ecoCoachTitle: 'Eco-Coach Insight',
            ecoCoachIdling: 'You left the engine idling {count}x this week. This wastes ~1.2L of fuel per hour and is recorded as an environmental fault in the exam.',
            ecoCoachLearn: 'Learn energy-saving driving',
            mistakeLabels: {
              'speeding': 'Speeding',
              'shoulder_check': 'Shoulder Check',
              'priority': 'Priority',
              'right_before_left': 'Right-Before-Left',
              'idling': 'Eco/Idling',
              'roundabout_signal': 'Roundabout Signal',
              'harsh_braking': 'Harsh Braking',
              'harsh_cornering': 'Harsh Cornering',
              'school_zone': 'School Zone',
              'school_zone_speeding': 'School Zone Speed',
              'curve_speeding': 'Cornering Speed',
              'aggressive_cornering': 'Aggressive Cornering',
              'wrong_way': 'Wrong Way',
              'illegal_turn': 'Illegal Turn',
              'pedestrian_safety': 'Pedestrian Safety'
            }
          },
          rubricItems: [
            {
              area: 'Observation & shoulder checks',
              check: 'Mirror use and clear shoulder checks during moving off, lane changes, turning, and reversing.',
              risk: 'Missing shoulder checks are among the most common serious exam faults.'
            },
            {
              area: 'Priority & rule application',
              check: 'Right-before-left, roundabouts, zebra crossings, traffic lights, bending priority roads, pedestrians/cyclists.',
              risk: 'Uncertain priority handling or incorrect behavior toward vulnerable road users.'
            },
            {
              area: 'Lane discipline & positioning',
              check: 'Clean positioning, correct keep-right behavior, turning lanes, and curb distance when parking.',
              risk: 'Wrong lane choice, late positioning, or poor vehicle placement.'
            },
            {
              area: 'Speed & vehicle control',
              check: 'Appropriate speed, smooth moving off, clutch/gear use in manual cars, and precise steering/braking.',
              risk: 'Rushing, stalling, unnecessary harsh braking, or approaching hazards too quickly.'
            },
            {
              area: 'Basic maneuvers',
              check: 'Parallel parking, reverse parking, turning, and emergency braking with correct observation and pedal sequence.',
              risk: 'Missing observation, wrong reference points, poor final position, or incorrect emergency braking.'
            },
            {
              area: 'Technical questions & vehicle check',
              check: 'Oil level, tyre tread, lighting, warning lights, warning triangle, safety vest, first-aid kit.',
              risk: 'Unsure answers or memorized responses without being able to physically show the item.'
            }
          ],
          screenDescriptions: [
            {
              name: 'Dashboard / Home',
              text: 'Shows learning progress, driving hours, special-drive or conversion notes, premium prompts, and quick access to exam-relevant content.'
            },
            {
              name: 'Curriculum overview',
              text: 'Lists all chapters and lessons in didactic order, including manual/automatic filtering, exam badges, and chapter progress.'
            },
            {
              name: 'Lesson detail',
              text: 'Combines guided learning points, typical exam scenarios, traffic signs, step-by-step guidance, common mistakes, and quizzes.'
            },
            {
              name: 'Maneuver quick reference',
              text: 'Provides quick review of parking, turning, emergency braking, and animated visualizations.'
            },
            {
              name: 'Logbook / Tracker',
              text: 'Tracks normal and special drives, shows target/actual values, and handles conversion cases separately without legal mandatory hours.'
            }
          ],
    },
    curriculumData: {
            lessons: {
              'basics-0': {
                title: 'Conversion: Germany Quickstart',
                description: 'The compact entry for conversion candidates: German exam logic, shoulder checks, priority, examiner commands, and typical traps.'
              },
              'basics-1': {
                title: 'Seating Position & Mirrors',
                description: 'The correct setup for safe driving',
                tips: [
                  { id: 'seat-tip1', title: 'Everything in Reach', content: 'Check before driving if you can fully depress the clutch without fully extending your leg.', type: 'info' }
                ]
              },
              'basics-1b': {
                title: 'Shoulder Check: Mandatory Situations',
                description: 'The most important observation routine for moving off, turning, lane changes, passing obstacles, and parking.',
                tips: [
                  { id: 'sb-tip1', title: 'Visibility Matters', content: 'The shoulder check must be clearly recognizable to the examiner as a head movement.', type: 'warning' }
                ]
              },
              'basics-1a': {
                title: 'Vehicle Check & Technical Questions',
                description: 'Engine bay, tyres, warning lights, lighting, and typical exam questions',
                scenarioSectionTitle: 'Typical Exam Questions & Technical Situations',
                scenarioSectionSubtitle: 'Step-by-step guidance for common technical questions in the practical exam'
              },
              'basics-2': {
                title: 'Starting & Stopping (Manual)',
                description: 'Starting engine, using clutch, moving off and stopping safely',
                tips: [
                  { id: 'start-tip1', title: 'Clutch with Feeling', content: 'Find the biting point and give only very slight gas.', type: 'info' }
                ]
              },
              'basics-2a': {
                title: 'Starting & Stopping (Automatic)',
                description: 'Starting engine, using gear selector, moving off and stopping safely',
                tips: [
                  { id: 'start-auto-tip1', title: 'Gear Selector Positions', content: 'P = Park, R = Reverse, N = Neutral, D = Drive (Forward). Always shift with foot on brake!', type: 'info' },
                  { id: 'start-auto-tip2', title: 'Creep Function', content: 'Automatic vehicles slowly roll in D or R without gas (creep function). Hold brake when stationary!', type: 'warning' }
                ]
              },
              'basics-3': {
                title: 'Shifting Gears & Clutch Technique',
                description: 'Gear changes, clutch technique and RPM awareness',
                tips: [
                  { id: 'shift-tip1', title: 'When to shift?', content: 'Upshift at ~2000-2500 RPM (diesel) or ~2500-3000 RPM (petrol). Downshift below ~1500 RPM.', type: 'info' },
                  { id: 'shift-tip2', title: 'Avoid Shifting Mistakes', content: 'Always fully depress the clutch! Never ride the clutch. This wears out the clutch.', type: 'warning' }
                ]
              },
              'basics-3a': {
                title: 'Drive Modes & Tiptronic',
                description: 'Automatic modes, sport mode and manual override',
                tips: [
                  { id: 'mode-tip1', title: 'Understanding Drive Modes', content: 'D = Normal, S = Sport (higher RPMs), some cars have Eco mode for fuel saving.', type: 'info' }
                ]
              },
              'basics-4': {
                title: 'Steering Wheel Control',
                description: 'Correct hand position and steering technique',
                tips: [
                  { id: 'steer-tip1', title: 'Quarter to Three Position', content: 'Always hold the steering wheel with both hands at the 9 and 3 o\'clock position for maximum control.', type: 'info' }
                ]
              },
              'basics-5': {
                title: 'Hill Starts (Manual)',
                description: 'Moving off uphill without rolling back',
                tips: [
                  { id: 'hill-tip1', title: 'Hold the Biting Point', content: 'Bring the clutch to the biting point until the engine sound changes and the car slightly "pulls", then release the handbrake.', type: 'info' },
                  { id: 'hill-tip2', title: 'Exam Relevant!', content: 'Hill starts are often tested in the exam. Practice both methods (handbrake and footbrake)!', type: 'warning' }
                ]
              },
              'basics-5a': {
                title: 'Hill Starts (Automatic)',
                description: 'Moving off uphill with automatic transmission and Hill-Hold Assist',
                tips: [
                  { id: 'hill-auto-tip1', title: 'Hill Hold Assist', content: 'Many modern automatic vehicles have Hill Hold Assist that holds the car for 2-3 seconds.', type: 'info' },
                  { id: 'hill-auto-tip2', title: 'Without Hill Hold', content: 'Hold brake, then promptly add gas. The creep function usually prevents strong rolling back.', type: 'info' }
                ]
              },
              'maneuver-1': {
                title: 'Parallel Parking',
                description: 'Side parking between two vehicles',
                scenarioSectionTitle: 'Typical Parking Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'park-tip1', title: 'Use Reference Points', content: 'Use the taillights or B-pillar of the parked car as a guide for when to steer.', type: 'info' }
                ]
              },
              'maneuver-2': {
                title: 'Reverse Bay Parking',
                description: 'Reversing into a parking bay',
                scenarioSectionTitle: 'Typical Parking Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'park-rev-tip1', title: 'Use Reference Points', content: 'Turn at 45 degrees when your side mirror passes the taillight of the parked car.', type: 'info' }
                ]
              },
              'maneuver-3': {
                title: 'Three-Point Turn',
                description: 'Turning in a narrow street',
                tips: [
                  { id: 'turn-tip1', title: 'Slow Roll, Fast Steer', content: 'Let the vehicle roll very slowly or stay stationary while steering quickly.', type: 'info' }
                ]
              },
              'maneuver-4': {
                title: 'Emergency Braking (Manual)',
                description: 'Full braking from 30 km/h - Clutch + Brake',
                tips: [
                  { id: 'brake-tip1', title: 'Full Force!', content: 'In the exam, you are expected to brake with FULL force. No half measures!', type: 'warning' },
                  { id: 'brake-tip2', title: 'Clutch only after braking has started', content: 'In a manual car, brake hard first. Use the clutch only afterwards or just before stalling so maximum deceleration is maintained.', type: 'warning' }
                ]
              },
              'city-1': {
                title: 'Right Before Left',
                description: 'Priority at intersections without signs (§ 8 StVO)',
                tips: [
                  { id: 'rvl-tip1', title: 'Possible Everywhere!', content: 'At intersections WITHOUT traffic lights, signs or police. Also in 30-zones and traffic-calmed areas!', type: 'info' },
                  { id: 'rvl-tip2', title: 'Note the § 10 StVO exceptions!', content: 'Anyone entering the road from properties, pedestrian zones, traffic-calmed areas, field/forest tracks, or over a lowered curb must yield to all other traffic.', type: 'warning' }
                ],
                scenarioSectionTitle: 'Special Right-before-Left Situations',
                scenarioSectionSubtitle: 'Important cases that frequently appear in the exam'
              },
              'city-2': {
                title: 'Turning (Left)',
                description: 'Turning left with oncoming traffic, traffic light phases, and positioning',
                scenarioSectionTitle: 'Typical Driving Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'amp-tip1', title: 'Green arrow sign ≠ green arrow traffic signal', content: 'The green arrow sign (sign 720) is a metal sign at a red light: first stop completely, then creep forward and yield to all traffic. The illuminated green arrow in the traffic signal is a protected movement and does not require an additional stop.', type: 'warning' },
                  { id: 'amp-tip2', title: 'The stop line is not the sight line', content: 'With the green arrow sign, the vehicle must first come to a real stop at the stop line. Only afterwards may you creep forward for better visibility.', type: 'info' },
                  { id: 'amp-tip3', title: 'Note for cyclists', content: 'There are now also green-arrow rules intended only for cyclists. For car drivers, the key point is to clearly distinguish the metal sign from the illuminated signal arrow.', type: 'info' }
                ],
                glossary: [
                  { id: 'lt-green-arrow-light', term: 'Protected green arrow signal', note: 'Protected left-turn phase within the traffic-light system. Oncoming traffic usually has red.' },
                  { id: 'lt-green-arrow-sign', term: 'Green arrow sign on red light', note: 'Permitted only after a complete stop at the stop line and then a careful creep forward.' },
                  { id: 'lt-tangential', term: 'Tangential left turning', note: 'When two opposing vehicles both turn left, they usually turn in front of one another.' }
                ],
                examinerCommands: [
                  { id: 'lt-cmd-left', command: 'At the next traffic light, please turn left.', note: '' },
                  { id: 'lt-cmd-arrow', command: 'Please follow the course of the priority road.', note: '' }
                ]
              },
              'city-3': {
                title: 'Roundabout',
                description: 'Rules for entering and exiting roundabouts',
                scenarioSectionTitle: 'Typical Driving Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'kreis-tip1', title: 'Do NOT signal when entering!', content: 'Signaling when ENTERING the roundabout is FORBIDDEN (could be misunderstood as immediate exit).', type: 'warning' },
                  { id: 'kreis-tip2', title: 'Signal when exiting!', content: 'After passing the previous exit, signal RIGHT to indicate you are leaving.', type: 'info' },
                  { id: 'kreis-tip3', title: 'Priority in Roundabout', content: 'With signs 205 + 215: Vehicles IN the roundabout have priority. Without signs: Right-before-Left applies!', type: 'warning' }
                ]
              },
              'city-4': {
                title: 'Zebra Crossing',
                description: 'Correct behavior at pedestrian crossings',
                scenarioSectionTitle: 'Typical Driving Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'zebra-tip1', title: 'Absolute Priority!', content: 'Pedestrians on the crosswalk ALWAYS have priority. Even if they only put one foot on the road!', type: 'warning' }
                ]
              },
              'maneuver-4a': {
                title: 'Emergency Braking (Automatic)',
                description: 'Full braking from 30 km/h - Brake only',
                tips: [
                  { id: 'brake-auto-tip1', title: 'Full Force!', content: 'In the exam, you are expected to brake with FULL force. No half measures!', type: 'warning' },
                  { id: 'brake-auto-tip2', title: 'Brake Only!', content: 'In an automatic vehicle, there is no clutching. Focus entirely on braking pressure.', type: 'info' }
                ]
              },
              'city-5': {
                title: 'Turning Right',
                description: 'Safely turning right with attention to cyclists, pedestrians, and traffic signals',
                scenarioSectionTitle: 'Typical Driving Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'right-tip1', title: 'Do not cut off cyclists', content: 'The right shoulder check immediately before turning is absolutely critical in the exam.', type: 'warning' }
                ]
              },
              'city-5a': {
                title: 'Traffic-Calmed Area & Zone 30',
                description: 'The often-confused differences between a traffic-calmed area and a 30-zone.',
                guidedPoints: [
                  { id: 'vb-gp1', title: 'Walking speed in TCA', content: 'In a traffic-calmed area (Sign 325.1), walking speed applies to everyone – including cyclists.' },
                  { id: 'vb-gp2', title: 'Priority when leaving', content: 'When leaving a traffic-calmed area, you must yield to all other traffic (§ 10 StVO). In a 30-zone, right-before-left usually applies.' },
                  { id: 'vb-gp3', title: 'Handle a bottleneck before a T-junction correctly', content: 'In 30-zones, parked vehicles often create bottlenecks directly before or after an intersection. Then it is not only about right-before-left, but also about creating space, scanning correctly, and using indicators properly.' }
                ],
                scenarios: [
                  {
                    id: 'vb-sc1',
                    title: 'The intersection pocket in a 30-zone',
                    situation: 'A parked vehicle blocks your lane just before a T-junction. A side street enters from the right. Immediately after the junction, another parked vehicle blocks your lane and oncoming traffic approaches. Many learners use the wrong indicators here or block the junction.',
                    steps: [
                      { id: 1, title: 'Signal left for the first bottleneck', description: 'Signal left, check interior and exterior mirrors, do a left shoulder check, and pass the first parked vehicle. This clearly shows that you are moving toward the middle of the road because of the obstacle.', icon: 'ArrowLeft' },
                      { id: 2, title: 'Move into the intersection pocket – WITHOUT a right indicator', description: 'When you reach the T-junction, steer slightly right into the mouth of the side street to create space. Observe right-before-left. Do NOT use the right indicator, because you are not actually turning right. A false right signal could mislead traffic coming from the right.', icon: 'ArrowRight' },
                      { id: 3, title: 'Let the vehicle from the right come out', description: 'Wait calmly in your refuge position and allow the vehicle from the right to turn left or join the road. You are not blocking the junction; you are deliberately creating space for traffic flow.', icon: 'Shield' },
                      { id: 4, title: 'Prepare for the second bottleneck with a left indicator', description: 'Once the vehicle from the right has passed, look ahead: if another obstacle blocks your side immediately after the junction and oncoming traffic is coming, use the left indicator. This tells oncoming traffic: I have seen you and I am waiting until I may move out past the second obstacle.', icon: 'ArrowLeft' },
                      { id: 5, title: 'Let oncoming traffic pass, then move out cleanly', description: 'Because the second parked vehicle is on your side, oncoming traffic has priority. Wait until the road is clear, then check mirrors and the left shoulder again and pass the second obstacle in a controlled way.', icon: 'Eye' }
                    ]
                  }
                ],
                tips: [
                  { id: 'vb-tip1', title: 'Classic exam trap', content: 'Many conversion students treat a traffic-calmed area like a normal street. That is wrong.', type: 'warning' },
                  { id: 'vb-tip2', title: 'Indicator trap in the intersection pocket', content: 'Do not signal right when you are only tucking briefly into the side street mouth to create space. A right indicator would falsely suggest a real right turn and could mislead other road users.', type: 'warning' },
                  { id: 'vb-tip3', title: 'Typical mistakes', content: 'Typical mistakes are blocking the junction, leaving no room for traffic from the right, or forgetting the oncoming traffic and the renewed left shoulder check at the second obstacle.', type: 'warning' }
                ]
              },
              'city-5b': {
                title: 'Zipper Merge',
                description: 'Merging where lanes are reduced (§ 7 StVO)',
                guidedPoints: [
                  { id: 'zip-gp1', title: 'Use the lane until the end', content: 'Do not panic and merge far too early. The ending lane is used until shortly before the obstacle.' },
                  { id: 'zip-gp2', title: 'Merge one by one', content: 'One vehicle from the continuing lane, then one from the ending lane – like a zipper.' }
                ],
                tips: [
                  { id: 'zip-tip1', title: 'Do not merge too early', content: 'Merging too early disturbs traffic flow and is exactly what many examiners criticize in conversion candidates.', type: 'warning' }
                ]
              },
              'city-5c': {
                title: 'Public Buses & Stops',
                description: 'Correct behavior with buses using hazard lights (§ 20 StVO)',
                guidedPoints: [
                  { id: 'bus-gp1', title: 'Take bus hazard lights seriously', content: 'If a public bus has hazard lights on at the stop, you may only pass at walking speed.' },
                  { id: 'bus-gp2', title: 'Applies in both directions', content: 'Depending on the situation, this caution also affects traffic coming the other way. Children may appear at any time.' }
                ],
                tips: [
                  { id: 'bus-tip1', title: 'Do not rush past bus stops', content: 'Bus stops are real hazard spots in the exam. Always expect pedestrians and children.', type: 'warning' }
                ]
              },
              'city-6': {
                title: 'Lane Change',
                description: 'Mirrors, indicators, and shoulder checks in city traffic',
                scenarioSectionTitle: 'Typical Driving Scenarios',
                scenarioSectionSubtitle: 'Step-by-step guidance for tricky practical situations',
                tips: [
                  { id: 'spur-tip1', title: 'Follow the sequence!', content: '1. Interior mirror 2. Side mirror 3. Signal 4. Shoulder check (blind spot!) 5. Change lanes', type: 'info' }
                ]
              },
              'city-7': {
                title: 'Stopping & Parking',
                description: 'Legal basis and signage (§ 12 StVO)',
                guidedPoints: [
                  { id: 'stoppark-gp1', title: 'Know the 3-minute rule', content: 'If you stop for more than three minutes or leave the vehicle, it legally counts as parking.' },
                  { id: 'stoppark-gp2', title: 'Read the signs and curb zones', content: 'Distinguish clearly between no stopping, restricted stopping, bus stops, areas near intersections, and driveways.' }
                ],
                tips: [
                  { id: 'stoppark-tip1', title: 'Classic examiner question', content: 'Examiners often ask during the drive: “Would you be allowed to stop or park here?” Answer calmly with the rule and the reason.', type: 'info' }
                ]
              },
              'city-8': {
                title: 'Entering & Exiting',
                description: 'Behavior at properties and parking areas (§ 10 StVO)',
                guidedPoints: [
                  { id: 'prop-gp1', title: 'Yield to everyone', content: 'When entering the road from properties, parking areas, petrol stations, or traffic-calmed areas, § 10 StVO applies: do not endanger others and yield to everyone.' },
                  { id: 'prop-gp2', title: 'Do not forget signal and shoulder check', content: 'When pulling out, the same rule applies: observe, signal clearly, and immediately before the lateral movement perform the shoulder check.' }
                ]
              },
              'city-9': {
                title: 'Railway Crossing',
                description: 'Safe behavior at St. Andrew’s Cross (§ 19 StVO)',
                guidedPoints: [
                  { id: 'rail-gp1', title: 'Take the railway crossing sign seriously', content: 'At the St. Andrew’s cross, rail traffic has priority. Never queue onto the tracks or stop on them.' },
                  { id: 'rail-gp2', title: 'Observe flashing lights and barriers', content: 'If red flashing lights appear or barriers are lowering, stop before the crossing. No overtaking and no rushing.' }
                ]
              },
              'city-10': {
                title: 'Emergency Vehicles',
                description: 'Blue lights and sirens (§ 38 StVO)',
                guidedPoints: [
                  { id: 'ev-gp1', title: 'Stay calm and create space', content: 'Recognise early where you can safely move. Move right and stop if necessary, but never block crosswalks or tracks.' }
                ]
              },
              'city-11': {
                title: 'Construction Sites & Bottlenecks',
                description: 'Single-lane traffic and obstacles (§ 6 StVO)',
              },
              'special-1': {
                title: 'Country Road Driving',
                description: 'Higher speeds, overtaking, and tree-lined avenues',
                tips: [
                  { id: 'country-tip1', title: 'Observe No Passing Zones', content: 'Solid line = Absolutely no overtaking!', type: 'warning' }
                ]
              },
              'special-2': {
                title: 'Motorway (Entering/Exiting)',
                description: 'Acceleration lanes and lane changes at high speed',
                tips: [
                  { id: 'highway-tip1', title: 'Use Acceleration Lane', content: 'Accelerate on the ramp and watch the flowing traffic.', type: 'info' }
                ]
              },
              'special-2a': {
                title: 'Motorway Special Rules',
                description: 'Emergency corridor, acceleration lane use, and typical motorway mistakes in the exam.',
                glossary: [
                  { id: 'motorway-ret', term: 'Emergency corridor', note: 'In stop-and-go traffic: the far-left lane moves left, all others move right.' },
                  { id: 'motorway-acc', term: 'Acceleration lane', note: 'Use it to match the speed of flowing traffic – not to brake too early.' }
                ]
              },
              'special-3': {
                title: 'Night Driving (Lighting)',
                description: 'Lighting features, visibility ranges, and wildlife hazards in the dark',
                scenarioSectionTitle: 'Night Driving Scenarios',
                scenarioSectionSubtitle: 'Handling darkness and poor visibility',
              },
              'exam-1': {
                title: 'Exam Readiness & Checklist',
                description: 'Final check before the practical driving exam.',
                scenarios: [
                  {
                    id: 'exam-first-minutes',
                    title: 'The First Minutes',
                    situation: 'The examiner introduces themselves, checks your ID, and may ask technical questions about the vehicle.',
                    steps: [
                      { id: 1, title: 'Have documents ready', description: 'Have your photo ID or passport ready.', icon: 'FileText' },
                      { id: 2, title: 'Adjust seat & mirrors', description: 'Even if it already fits: check and adjust if necessary to show care.', icon: 'Settings' },
                      { id: 3, title: 'Fasten seatbelt', description: 'Don’t forget before the engine is started!', icon: 'CheckCircle' }
                    ]
                  }
                ],
                tips: [
                  { id: 'check-tip1', title: 'Bring to the exam', content: '✓ Photo ID/Passport ✓ Glasses if needed ✓ Theory test certificate ✓ Training documentation', type: 'warning' },
                  { id: 'check-tip2', title: 'Exam duration', content: 'The practical exam lasts approx. 45 minutes. 3 basic maneuvers are tested (selected from the catalog).', type: 'info' }
                ]
              },
              'exam-1a': {
                title: 'Exiting the Vehicle Safely (Dutch Reach)',
                description: 'Safe door opening at the end of the exam and in everyday driving.',
                glossary: [
                  { term: 'Dutch Reach', note: 'Open the door with the far hand so the upper body turns automatically and the shoulder check becomes more natural.' }
                ],
                guidedPoints: [
                  { id: 'exit-gp1', title: 'Check mirrors before opening', content: 'Look in the interior mirror and left side mirror.' },
                  { id: 'exit-gp2', title: 'Shoulder check to the rear', content: 'Check if a cyclist or car is coming from behind.' },
                  { id: 'exit-gp3', title: 'Open door only a crack', content: 'Open only a little bit first to check again before getting out completely.' }
                ]
              },
              'exam-2': {
                title: 'Handling Exam Anxiety',
                description: 'Tips against nervousness on exam day.',
                tips: [
                  { id: 'anxiety-tip1', title: 'The examiner wants you to pass!', content: 'The examiner evaluates according to the driving task catalog - objectively and fairly. Small mistakes don’t mean failure.', type: 'success' },
                  { id: 'anxiety-tip2', title: 'Get enough sleep', content: 'Go to bed early and avoid too much caffeine before the exam.', type: 'info' }
                ]
              },
              'exam-2a': {
                title: 'Top Reasons for Failing',
                description: 'The most important situations that can lead to an immediate fail in the practical exam.',
                guidedPoints: [
                  { id: 'fail-gp1', title: 'Danger to others matters more than style mistakes', content: 'Taking priority, endangering pedestrians, running a red light, or driving with serious insecurity usually leads to immediate failure.' },
                  { id: 'fail-gp2', title: 'A missing shoulder check can be decisive', content: 'Forgetting once is often no problem, but repeatedly ignoring the shoulder check (e.g. when turning) leads to failure.' }
                ]
              },
              'exam-3': {
                title: 'Eco-Friendly Driving',
                description: 'Fuel-efficient driving and low RPMs.',
                tips: [
                  { id: 'eco-tip1', title: 'Shift up early', content: 'Shift up between 2000-2500 RPM. Low-rev driving saves fuel.', type: 'info' },
                  { id: 'eco-tip2', title: 'Drive anticipatively', content: 'Coast instead of braking when a light is red.', type: 'info' }
                ]
              },
              'exam-sim': {
                title: 'Mock Exam: Live Sim',
                description: 'Realistic simulation with time pressure and feedback.'
              }
            },
            parallelParkingSteps: [
              { title: 'Choose the space deliberately', description: 'Drive slowly and choose a space that is realistically large enough. If in doubt, continue driving rather than forcing a gap that is too small.' },
              { title: 'Stop next to the front vehicle', description: 'Signal right and stop parallel next to the front vehicle. A practical reference point is often that your right side mirror is roughly aligned with the other car’s B-pillar or rear-door area.' },
              { title: '360° check before the first reverse movement', description: 'Before the first reverse movement, fully secure the traffic space: check left, use the mirrors, check right, and secure the rear area through the side and rear windows.' },
              { title: 'Steer in with a right shoulder check', description: 'Reverse very slowly. Immediately before steering in, show a clear right shoulder check to secure cyclists and pedestrians on the curb side. Then steer fully right. A vehicle-specific reference point should be calibrated with your instructor, for example when the front vehicle reaches a certain position in the right mirror.' },
              { title: 'Use a driver-perspective counter-steer point', description: 'When the turn-in angle is established and you recognise the counter-steer point in the mirror or side window, steer fully left. Typical references always depend on the vehicle and must be calibrated in the driving school car.' },
              { title: 'Straighten parallel and check curb distance', description: 'Straighten the vehicle parallel to the curb. Use mirrors and your view front and rear to check the distance – the exam target is cleanly parallel and no more than about 30 cm from the curb.' },
              { title: 'Use a left shoulder check before any forward correction', description: 'If you need to move forward for a correction, secure the traffic side with mirrors and a left shoulder check before pulling forward. Before reversing again, secure the area all around once more.' }
            ],
            reverseParkingSteps: [
              { title: 'Set up a clean starting position', description: 'Drive past the target bay and position your vehicle parallel with about 0.8 to 1.0 m lateral distance. The exact starting position and reference points must be calibrated in the driving school car.' },
              { title: '360° check before reversing', description: 'Before reversing, check all mirrors and secure both sides plus the area behind the vehicle with a full 360° observation.' },
              { title: 'Begin steering at the vehicle-specific reference point', description: 'Reverse very slowly. As soon as you reach the steering reference point practised in your driving school car – for example shoulder, mirror, or rear side window aligned with a bay marking – steer in promptly.' },
              { title: 'Check both lines in the mirrors', description: 'Watch both side lines in the wing mirrors. The vehicle should move into the bay evenly and not cut across one of the lines.' },
              { title: 'Straighten at the right moment', description: 'When the vehicle is nearly parallel to the parking lines, straighten the wheel promptly and continue reversing slowly.' },
              { title: 'Check final position and center the car', description: 'Final check: vehicle straight, centered in the bay, with similar distance to both lines and without protruding at the front or rear.' }
            ],
            threePointTurnSteps: [
              { title: 'Observe Traffic', description: 'Look around! Is the road clear in both directions? No turning restrictions?' },
              { title: 'Signal Left', description: 'Signal left and slowly move forward. Steer fully left.' },
              { title: 'Stop Before Curb', description: 'Stop just before the opposite curb.' },
              { title: 'Shoulder Check & Reverse', description: 'Shoulder check! Steer fully right and reverse.' },
              { title: 'Stop Again', description: 'Stop just before the curb behind you.' },
              { title: 'Drive Forward', description: 'Steer left and drive forward in the new direction.' }
            ],
            emergencyBrakingStepsManual: [
              { title: 'Speed: approx. 30 km/h', description: 'Emergency braking is performed from approx. 30 km/h. The instructor gives the command.' },
              { title: 'No shoulder check before braking', description: 'IMPORTANT: During emergency braking, the instructor secures the traffic behind. You react immediately to the front.' },
              { title: 'Brake hard first', description: 'Immediately press the brake pedal with full force. The goal is maximum deceleration while keeping the vehicle stable.' },
              { title: 'Press the clutch only afterwards', description: 'Press the clutch only after full braking has already started, or just before the engine would stall, so the engine does not cut out.' },
              { title: 'Hold the wheel firmly and straight', description: 'Hold the wheel firmly with both hands, keep straight, and only evade if that is explicitly trained by the instructor.' },
              { title: 'Accept ABS pulsing', description: 'If the pedal pulses, ABS is working. Do not reduce the braking pressure.' },
              { title: 'Secure the situation before moving off again', description: 'After the stop: secure the vehicle and before moving off again, check mirrors and perform a left shoulder check.' }
            ],
            emergencyBrakingStepsAutomatic: [
              { title: 'Speed: approx. 30 km/h', description: 'Emergency braking is performed from approx. 30 km/h. The instructor gives the command.' },
              { title: 'No shoulder check before braking', description: 'IMPORTANT: During emergency braking, the instructor secures the traffic behind. You react immediately to the front.' },
              { title: 'Brake only – full force', description: 'With automatic, press the brake pedal immediately with full force. No clutch action is needed.' },
              { title: 'Hold the wheel firmly and straight', description: 'Hold the wheel firmly with both hands, stay straight, and do not swerve in panic.' },
              { title: 'Accept ABS pulsing', description: 'If the pedal pulses, ABS is working. Do not reduce the braking pressure.' },
              { title: 'Secure the situation before moving off again', description: 'After the stop, secure the vehicle and before moving off again, check mirrors and perform a left shoulder check.' }
            ],
            maneuverTips: [
              { title: 'Don\'t forget the all-round check!', content: 'One of the most common exam mistakes! Before every reverse movement perform an all-round check, and at every change of direction clearly show the appropriate shoulder check.' },
              { title: 'Drive Slowly (1-3 km/h)', content: 'Drive extremely slowly during maneuvers: 1-3 km/h. In a manual car, modulate clutch and brake carefully; in an automatic, use creeping speed and light brake control.' },
              { title: 'Max 2 Corrections', content: 'In the exam, 2 corrections are allowed. When correcting: Don\'t forget to signal!' },
              { title: 'Distance to Curb', content: 'Parallel parking: Max. 30cm to curb (about A4 paper width). Closer = better!' },
              { title: 'Watch Traffic', content: 'Other road users have priority. Make eye contact and wave them through if needed.' }
            ],
            leftTurnGuidedPoints: [
              { title: 'Position early', content: 'Move into position for a left turn early, reduce speed, and check traffic behind you in the interior and side mirrors.' },
              { title: 'Scanning routine', content: 'Watch oncoming traffic, crossing pedestrians, cyclists on cycle paths, and any vehicle that may try to overtake you.' },
              { title: 'Distinguish protected and unprotected left turns', content: 'On a normal green light, you usually must yield to oncoming traffic and crossing pedestrians/cyclists. With a protected green left arrow, oncoming traffic and crossing pedestrians usually face red.' },
              { title: 'Use one-way streets correctly', content: 'Before turning left from a one-way street, position yourself as far left as possible. When turning into a one-way street, still choose the correct lane and keep to the right rule.' },
              { title: 'Fully understand bending priority roads', content: 'If you follow a bending priority road, signal in the direction of the road’s course. If you leave the priority road by an actual turn, you must also signal. In addition, vehicles leaving the priority road must pay attention to mutual priority and not obstruct one another.' },
              { title: 'Take trams and multi-lane turns seriously', content: 'In practice, trams must be treated with great caution and should never be cut off. In multi-lane left turns, keep your lane precisely and follow guide markings accurately.' },
              { title: 'Exam-ready observation', content: 'The examiner watches whether you check left-right-forward again just before turning and complete the turn calmly.' }
            ],
            glossary: [
              { term: 'Shoulder check', note: 'In Germany, this must be clearly visible in many exam situations.' },
              { term: 'Right-of-way / priority', note: 'You must not only know the rule but also apply it actively and wait when needed.' },
              { term: 'Emergency braking', note: 'Brake immediately, keep the vehicle stable, then secure the traffic situation before moving off again.' },
              { term: 'All-round / 360° observation', note: 'Before every reversing movement and before pulling out, actively secure the space around the car.' },
              { term: 'Emergency corridor', note: 'Mandatory on motorways and multi-lane out-of-town roads in stop-and-go traffic.' }
            ],
            examinerCommands: [
              { command: 'Please pull over on the right.', note: 'Find a suitable place calmly, use mirrors, signal, shoulder check, then stop.' },
              { command: 'At the next intersection, please turn left.', note: 'Position early and observe left, right, and ahead in good time.' },
              { command: 'We follow the bending priority road.', note: 'Signal and observe – respect priority rules against other turners.' },
              { command: 'Drive towards the motorway.', note: 'Watch the signs, position early, and follow turning routine (mirrors, signal, shoulder check).' }
            ],
            trafficSigns: {
              greenArrow: {
                title: 'Green Arrow Sign',
                description: 'Small metal sign next to the red light. Turning right is only allowed after a COMPLETE stop at the stop line. Then creep forward carefully and grant absolute priority to all other traffic.'
              },
              greenArrowSignal: {
                title: 'Green Arrow Light Signal',
                description: 'Glowing arrow in the traffic light system. No additional stop required; it indicates protected movement in the specified direction.'
              }
            },
            guidedPoints: {
              laneChange: [
                { title: 'Fixed sequence', content: 'Interior mirror → side mirror → signal → shoulder check → lane change.' },
                { title: 'Judge lateral space', content: 'Check whether a motorcycle, bicycle, or faster car may appear in the blind spot.' },
                { title: 'Do not force the lane change', content: 'If the gap is too small, stay calm in your lane and try again later.' }
              ],
              rightBeforeLeft: [
                { title: 'Ease off early', content: 'Reduce speed early at unclear intersections and stay ready to brake.' },
                { title: 'Actively look to the right', content: 'A common exam mistake is not the rule itself, but looking right too late.' },
                { title: 'Understand § 10 StVO – not only the curb shape', content: 'Right-before-left does not apply to vehicles entering the carriageway from properties, pedestrian zones, traffic-calmed areas, field/forest tracks, or over a lowered curb. They must yield to all other traffic.' }
              ],
              roundabout: [
                { title: 'Check the signs before entering', content: 'Check for signs 205 and 215 before the roundabout. With both signs, traffic already in the roundabout has priority.' },
                { title: 'Do not signal when entering', content: 'In Germany, you generally do not signal when entering a roundabout.' },
                { title: 'Announce your exit in time', content: 'After passing the previous exit, signal right and check pedestrians and cyclists at your exit.' },
                { title: 'Visual scanning inside the roundabout', content: 'Scan the entry area, then the roundabout, then the upcoming exit. Keep speed calm and steady.' }
              ],
              zebra: [
                { title: 'Recognize early and prepare to brake', content: 'Reduce speed in good time before a zebra crossing and actively scan both sides.' },
                { title: 'Pedestrians have priority', content: 'Clearly intending pedestrians have priority, not only once they are already in the middle.' },
                { title: 'Watch cyclists and hidden people', content: 'Take extra care with children, e-scooters, parked cars, and bus stops near the crossing.' }
              ],
              rightTurn: [
                { title: 'Position early for the right turn', content: 'Move into the correct right-turn position early, without blocking cycle lanes.' },
                { title: 'Watch pedestrians and cyclists', content: 'Before steering, check crossing pedestrians and cyclists traveling parallel to you.' },
                { title: 'Neither too tight nor too fast', content: 'Turn in under control into the correct right half of the destination road and stay ready to stop.' }
              ],
              parking: [
                { title: 'Secure the traffic space before maneuvering', content: 'Before every reversing movement, actively secure the area around the car. In the exam, visible all-round observation matters more than perfect steering.' },
                { title: 'Use the shoulder check that matches the movement direction', content: 'Before steering backwards into the space, the right shoulder check is especially important. Before every forward correction, secure the traffic side with a left shoulder check.' },
                { title: 'Move slowly and allow corrections', content: 'Maneuver very slowly so corrections remain possible and your observation is clearly visible.' },
                { title: 'Observe parking restrictions and visibility', content: 'Do not stop/park in no-stopping areas, in front of driveways, too close to intersections, or on cycle paths.' }
              ],
              countryRoad: [
                { title: 'Keep right rule', content: 'Strictly keep right, especially in curves and on crests.' },
                { title: 'Adjust speed', content: 'The permissible 100 km/h is often too much for narrow or forest sections.' },
                { title: 'Overtake only when safe', content: 'Overtake only if the road is clearly visible far ahead and there is no restriction.' }
              ],
              nightDriving: [
                { title: 'Visibility = Speed', content: 'Drive only as fast as allows you to stop within the clearly visible distance.' },
                { title: 'Don\'t forget to dim', content: 'Switch to low beams in good time for oncoming traffic or when following closely.' },
                { title: 'Wildlife hazard', content: 'In forest sections, pay particular attention to the roadside (glowing eyes).' }
              ],
              examChecklist: [
                { title: 'Seat and mirrors', content: 'Adjust everything correctly before starting the engine.' },
                { title: 'Fasten seatbelt', content: 'Never forget to fasten your seatbelt before moving off.' }
              ],
              vehicleCheck: [
                { id: 'vehicle-check-gp1', title: 'Explain the engine bay calmly and systematically', content: 'In the exam, simply pointing is often not enough. Name the parts clearly: engine oil, coolant, washer fluid, battery, brake fluid - as far as visible and accessible in the vehicle.' },
                { id: 'vehicle-check-gp2', title: 'Check engine oil with the dipstick', content: 'Park on level ground if possible, switch the engine off, wait briefly, pull out the dipstick, wipe it, reinsert it, pull it out again, and read the level between min and max.' }
              ],
              zipper: [
                { title: 'Use the lane until the end', content: 'Do not panic and merge far too early. The ending lane is used until shortly before the obstacle.' },
                { title: 'Merge one by one', content: 'One vehicle from the continuing lane, then one from the ending lane – like a zipper.' }
              ],
              trafficCalmed: [
                { title: 'Maintain walking speed', content: 'In traffic-calmed areas (play streets), walking speed (approx. 4-7 km/h) applies, no faster.' },
                { title: 'Roll into the intersection pocket – WITHOUT right indicator', content: 'When you reach the T-junction, steer slightly right into the side street mouth to create space. Observe right-before-left. Do NOT signal right.' },
                { title: 'Let the vehicle from the right exit', content: 'Stay calm in your refuge position and allow the vehicle from the right to turn left.' },
                { title: 'Prepare for the second bottleneck with a left indicator', content: 'Once the vehicle from the right has passed, check ahead for further obstacles.' },
                { title: 'Let oncoming traffic pass, then move out cleanly', content: 'Since the second parked vehicle is on your side, oncoming traffic has priority.' }
              ],
              bus: [
                { title: 'Take bus hazard lights seriously', content: 'If a public bus has hazard lights on at the stop, you may only pass at walking speed.' },
                { title: 'Applies in both directions', content: 'Depending on the situation, this caution also affects traffic coming the other way. Children may appear at any time.' }
              ],
              stoppingParking: [
                { title: 'Know the 3-minute rule', content: 'If you stop for more than three minutes or leave the vehicle, it legally counts as parking.' },
                { title: 'Read the signs and curb zones', content: 'Distinguish clearly between no stopping, restricted stopping, bus stops, areas near intersections, and driveways.' }
              ],
              properties: [
                { title: 'Yield to everyone', content: 'When entering the road from properties, parking areas, petrol stations, or traffic-calmed areas, § 10 StVO applies: do not endanger others and yield to everyone.' },
                { title: 'Do not forget signal and shoulder check', content: 'When pulling out, the same rule applies: observe, signal clearly, and immediately before the lateral movement perform the shoulder check.' }
              ],
              railway: [
                { title: 'Take the railway crossing sign seriously', content: 'At the St. Andrew’s cross, rail traffic has priority. Never queue onto the tracks or stop on them.' },
                { title: 'Observe flashing lights and barriers', content: 'If red flashing lights appear or barriers are lowering, stop before the crossing. No overtaking and no rushing.' }
              ],
              emergency: [
                { title: 'Stay calm and create space', content: 'Recognise early where you can safely move. Move right and stop if necessary, but never block crosswalks or tracks.' }
              ],
              cyclists: [
                { title: 'Keep the minimum distance', content: 'Keep at least 1.5 m in built-up areas and 2.0 m outside built-up areas. If there is not enough room, do not overtake.' }
              ],
              motorway: [
                { title: 'Create the emergency corridor immediately', content: 'As soon as traffic slows to a crawl, create the corridor – not only when you see blue lights.' },
                { title: 'Do not brake unnecessarily at the end of the acceleration lane', content: 'Accelerate actively on the ramp, find a gap, and merge decisively. Braking at the end is a common exam error.' }
              ],
              hazards: [
                { title: 'Read clues, not just rules', content: 'A ball in the road, an ice-cream truck, a sliding delivery van door, or a cyclist looking over their shoulder are warning signs of the next hazard.' },
                { title: 'Adjust speed proactively', content: 'Defensive driving means reducing the risk early rather than reacting harshly later.' }
              ],
              exit: [
                { title: 'Merge in time', content: 'Change lanes early before turning or exiting a motorway. Hesitation often leads to dangerous maneuvers.' },
                { title: 'Only reduce speed on the exit lane', content: 'Do not brake on the motorway itself; only start decelerating once you are on the exit lane.' }
              ],
              fail: [
                { title: 'Yielding violated', content: 'Overlooking a "Yield" sign or a vehicle from the right is the most common reason for immediate failure.' },
                { title: 'Shoulder check forgotten', content: 'Missing the shoulder check, especially when turning or changing lanes, is a knockout criterion.' },
                { title: 'Red light or stop sign', content: 'Running a red light or failing to come to a complete stop at a stop sign.' }
              ]
            },
            quizzes: {
              basics: [
                {
                  id: 'quiz-seat',
                  question: 'How do you check the correct distance to the steering wheel?',
                  options: [
                    { id: 'a', text: 'Arms fully extended' },
                    { id: 'b', text: 'Wrists rest on top of the steering wheel rim with arms extended' },
                    { id: 'c', text: 'Upper body as close as possible to the steering wheel' }
                  ],
                  explanation: 'Your wrists should rest on the top of the rim with arms extended, so your arms are slightly bent when gripping in the 9-and-3 o\'clock position.'
                }
              ],
              mirror: [
                {
                  id: 'quiz-sb',
                  question: 'When is a shoulder check mandatory in Germany?',
                  options: [
                    { id: 'a', text: 'Only when reversing' },
                    { id: 'b', text: 'Before every turn, lane change, and when moving off' },
                    { id: 'c', text: 'Not at all if the mirrors are large' }
                  ],
                  explanation: 'The shoulder check secures the "blind spot" that mirrors cannot capture.'
                }
              ],
              tech: [
                {
                  id: 'quiz-oil',
                  question: 'How do you correctly check the engine oil level?',
                  options: [
                    { id: 'a', text: 'With the engine running' },
                    { id: 'b', text: 'On level ground, engine off, wait briefly, use dipstick' },
                    { id: 'c', text: 'Only when the warning light is on' }
                  ],
                  explanation: 'For an accurate measurement, the oil must drain back into the pan and the vehicle must be level.'
                }
              ],
              maneuver: [
                {
                  id: 'quiz-park-1',
                  question: 'How many correction moves are allowed during parking in the exam?',
                  options: [
                    { id: 'a', text: 'Maximum 2' },
                    { id: 'b', text: 'As many as you like' },
                    { id: 'c', text: 'None' }
                  ],
                  explanation: 'In the practical exam, a maximum of 2 correction moves are permitted per basic maneuver.'
                }
              ],
              emergencyBrake: [
                {
                  id: 'quiz-eb-1',
                  question: 'What is crucial during emergency braking in a manual car?',
                  options: [
                    { id: 'a', text: 'Brake gently' },
                    { id: 'b', text: 'Press clutch and brake abruptly and fully at the same time' },
                    { id: 'c', text: 'First perform a shoulder check' }
                  ],
                  explanation: 'Immediate maximum deceleration is the goal. The instructor secures the area behind.'
                }
              ],
              city: [
                {
                  id: 'quiz-rvl',
                  question: 'Where does the "Right before Left" rule apply?',
                  options: [
                    { id: 'a', text: 'At all intersections' },
                    { id: 'b', text: 'At intersections without priority signs or traffic lights' },
                    { id: 'c', text: 'Only in dead-end streets' }
                  ],
                  explanation: 'Right before Left (§ 8 StVO) always applies when no other regulation (signs, lights, police) is present.'
                },
                {
                  id: 'quiz-roundabout',
                  question: 'When must you signal in a roundabout (Sign 215)?',
                  options: [
                    { id: 'a', text: 'When entering' },
                    { id: 'b', text: 'When exiting' },
                    { id: 'c', text: 'Both' }
                  ],
                  explanation: 'In Germany, you do NOT signal when entering the roundabout. Signaling right is mandatory only when exiting.'
                }
              ]
            },
            scenarios: [
              {
                id: 'left-turn-unprotected-green',
                title: 'Unprotected left turn on green',
                situation: 'You have a normal green light, but oncoming traffic has green as well. This is the classic unprotected left turn intersection.',
                steps: [
                  { title: 'Mirrors, signal, position', description: 'Check interior and side mirrors, signal left, and position yourself cleanly towards the center.', icon: 'AlignCenter' },
                  { title: 'Roll to the center with straight wheels', description: 'Approach the center of the intersection carefully and keep the wheels straight, so a rear-end collision doesn’t push you into oncoming traffic.', icon: 'ArrowUp' },
                  { title: 'Yield to oncoming traffic', description: 'Let all oncoming vehicles going straight or turning right pass first.', icon: 'AlertTriangle', critical: true },
                  { title: 'Check pedestrians and cyclists', description: 'Before turning, check for crossing pedestrians and cyclists on the destination road.', icon: 'Eye', critical: true },
                  { title: 'Turn into target lane calmly', description: 'Complete the turn with a smooth steering movement into the correct side of the new road.', icon: 'CornerDownRight' }
                ],
                mistakes: [
                  { title: 'Cutting across too early', content: 'Do not cut the corner too early. It endangers oncoming traffic and often leads to the wrong lane choice.' },
                  { title: 'Waiting with wheels already turned', content: 'If you are waiting in the intersection, keep the wheels straight—otherwise a rear-end impact may push you into oncoming traffic.' }
                ]
              },
              {
                id: 'left-turn-protected-arrow',
                title: 'Protected left turn with green arrow signal',
                situation: 'You have a green left-turn arrow. Oncoming traffic and crossing pedestrians normally face red.',
                steps: [
                  { title: 'Still check the intersection area', description: 'Even with a protected arrow, quickly check whether anyone unexpectedly enters the intersection area.', icon: 'Eye' },
                  { title: 'Turn without waiting in the middle', description: 'You may take the turn directly and do not need to wait in the middle of the intersection.', icon: 'CornerDownRight' },
                  { title: 'Keep the lane clean', description: 'Despite having priority, land exactly in the appropriate target lane and do not pull out unnecessarily wide.', icon: 'AlignCenter' }
                ]
              },
              {
                id: 'left-turn-one-way-from',
                title: 'Left turn from a one-way street',
                situation: 'You are driving in a one-way street and want to turn left.',
                steps: [
                  { title: 'Position as far left as possible', description: 'Before turning, position yourself as far left as possible unless markings indicate otherwise.', icon: 'AlignCenter' },
                  { title: 'Check left blind spot', description: 'Pay particular attention to cyclists, e-scooters, or others overtaking on the left.', icon: 'Eye', critical: true },
                  { title: 'Do not turn from the center', description: 'Turning left from the center or right side of a one-way street is a serious mistake in the exam.', icon: 'AlertTriangle', critical: true },
                  { title: 'Enter target lane cleanly', description: 'Do not swing out too wide and drive directly into the correct side of the target road.', icon: 'CornerDownRight' }
                ]
              },
              {
                id: 'left-turn-tangential',
                title: 'Tangential left turn',
                situation: 'You and the oncoming vehicle both want to turn left. The rule in Germany is tangential turning in front of each other.',
                steps: [
                  { title: 'Approach the center cleanly', description: 'Do not cut across diagonally early, but roll into the intersection area in a controlled manner.', icon: 'ArrowUp' },
                  { title: 'Rule: turn in front of each other', description: 'Usually, both left-turners turn tangentially in front of each other. This keeps paths short, clear, and low-conflict.', icon: 'CornerDownRight', critical: true },
                  { title: 'Recognise exceptions', description: 'If road markings, offset lanes, or the specific traffic situation do not allow turning in front of each other, turning behind each other may be necessary as an exception.', icon: 'Info' },
                  { title: 'Hit the target lane cleanly', description: 'Regardless of the method, end up on the correct side of the target road.', icon: 'AlignCenter' }
                ],
                mistakes: [
                  { title: 'Not knowing the rule', content: 'Many candidates hesitate even though tangential turning in front of each other is the standard situation.' },
                  { title: 'Overlooking exceptions despite markings', content: 'If the intersection geometry or markings require a different path, this must be recognised and followed.' }
                ]
              },
              {
                id: 'left-turn-one-way-into',
                title: 'Left turn into a one-way street',
                situation: 'You turn left into a one-way street. There is no oncoming traffic, but lane choice remains important.',
                steps: [
                  { title: 'Observe the entrance', description: 'Make sure by signage and markings that the target road is actually a one-way street.', icon: 'Info' },
                  { title: 'Follow the right-hand rule', description: 'Even without oncoming traffic, do not stick to the left; enter the appropriate right lane or right half of the road.', icon: 'AlignCenter', critical: true },
                  { title: 'Watch for cyclists and pedestrians', description: 'Pay attention to road users crossing or riding parallel, especially at the junction.', icon: 'Eye' }
                ]
              },
              {
                id: 'left-turn-multi-lane',
                title: 'Multi-lane parallel left turn',
                situation: 'Two or more lanes turn left at the same time. Guidelines are present.',
                steps: [
                  { title: 'Choose your lane clearly', description: 'Position yourself correctly before the intersection and use the appropriate turning lane.', icon: 'AlignCenter' },
                  { title: 'Follow the guidelines', description: 'Follow the dashed guidelines exactly while turning.', icon: 'ArrowUp' },
                  { title: 'Keep your lane - do not drift', description: 'Do not drift too far out from the inside and do not cut the corner from the outside.', icon: 'AlertTriangle', critical: true }
                ]
              },
              {
                id: 'left-turn-right-before-left',
                title: 'Left turn at unmarked Right-before-Left intersection',
                situation: 'No signs, no lights - just a quiet residential intersection. You want to turn left.',
                steps: [
                  { title: 'Brake early', description: 'Approach confusing intersections slowly and stay ready to brake.', icon: 'Circle' },
                  { title: 'Watch vehicles from the right', description: 'Vehicles from the right have priority - even if you want to turn left.', icon: 'Shield', critical: true },
                  { title: 'Also yield to oncoming traffic', description: 'Additionally, you must yield to oncoming traffic going straight.', icon: 'AlertTriangle', critical: true },
                  { title: 'Only then turn left', description: 'You are almost at the bottom of the priority order in this situation - only drive when everything is truly clear.', icon: 'CornerDownRight' }
                ]
              },
              {
                id: 'left-turn-bending-priority-follow',
                title: 'Follow bending priority to the left',
                situation: 'The thick black line on the priority sign bends to the left and you want to follow the priority road.',
                steps: [
                  { title: 'Recognise priority sign early', description: 'Identify in good time where the priority road leads.', icon: 'Info' },
                  { title: 'Signal left', description: 'Even if you stay on the main road: because your vehicle steers left, you must signal left.', icon: 'ArrowLeft', critical: true },
                  { title: 'Observe side directions', description: 'Despite having priority, watch out for waiting vehicles and pedestrians.', icon: 'Eye' }
                ]
              },
              {
                id: 'left-turn-bending-priority-leave',
                title: 'Leave bending priority',
                situation: 'The main road bends left, but you want to continue straight ahead or seemingly slightly right out of the priority road.',
                steps: [
                  { title: 'Recognise traffic on the priority road', description: 'Vehicles following the main road to the left remain prioritised.', icon: 'Shield' },
                  { title: 'Do not signal left incorrectly', description: 'When leaving the priority road, do not act as if you are following it to the left.', icon: 'AlertTriangle', critical: true },
                  { title: 'Yield to prioritised vehicles', description: 'Wait, if necessary, for vehicles following the main road to the left.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'left-turn-tram',
                title: 'Left turn at tram tracks',
                situation: 'You want to turn left across tram tracks and a tram is approaching.',
                steps: [
                  { title: 'Recognise tram early', description: 'Check while approaching whether a tram is coming or starting from a stop.', icon: 'Search' },
                  { title: 'Wait before the tracks', description: 'If a tram is approaching, stop before the tracks and let it pass first.', icon: 'Square', critical: true },
                  { title: 'Do not speculate on time', description: 'Trams are long, heavy, and often cannot swerve - do not turn left closely in front of them.', icon: 'AlertTriangle', critical: true },
                  { title: 'Only then complete the turn', description: 'After the tram has passed, check all around again and only then turn left safely.', icon: 'CornerDownRight' }
                ]
              },
              {
                id: 'rb-standard-entry',
                title: 'Standard Roundabout with Inside Priority',
                situation: 'You approach a roundabout with signs 205 (Yield) and 215 (Roundabout) and want to take the second exit.',
                steps: [
                  { title: 'Reduce speed early', description: 'Slow down significantly before entering and be ready to brake.', icon: 'Circle' },
                  { title: 'Check to the left into the circle', description: 'Pay attention to vehicles already driving in the roundabout.', icon: 'Eye', critical: true },
                  { title: 'Enter without signaling', description: 'Enter as soon as it is clear. Do not signal when entering.', icon: 'ArrowRight', critical: true },
                  { title: 'Signal right before the desired exit', description: 'After passing the exit before yours, signal right and watch for pedestrians/cyclists.', icon: 'CheckCircle' }
                ],
                mistakes: [
                  { title: 'Signaling too early', content: 'Signaling when entering is a classic exam mistake.' }
                ]
              },
              {
                id: 'rb-no-signs',
                title: 'Small Roundabout without Signage',
                situation: 'You arrive at a small roundabout without signs 205/215.',
                steps: [
                  { title: 'Re-evaluate situation', description: 'Without the usual signs, priority inside the circle is not automatic.', icon: 'Info' },
                  { title: 'Observe Right-before-Left', description: 'Check carefully who is coming from the right and if you must wait.', icon: 'Shield', critical: true }
                ]
              },
              {
                id: 'zebra-child-waiting',
                title: 'Child Waiting at the Crossing',
                situation: 'A child stands at the curb near the zebra crossing and looks toward the road.',
                steps: [
                  { title: 'Reduce speed clearly', description: 'Reduce speed early so you can stop at any time.', icon: 'Circle' },
                  { title: 'Stay ready to brake', description: 'Children are unpredictable and may step out suddenly.', icon: 'AlertTriangle', critical: true },
                  { title: 'Stop and yield', description: 'As soon as it is clear the child wants to cross, stop before the crossing.', icon: 'CheckCircle', critical: true }
                ]
              },
              {
                id: 'zebra-hidden-pedestrian',
                title: 'Hidden Pedestrian behind a Van',
                situation: 'A delivery van blocks the view of the zebra crossing.',
                steps: [
                  { title: 'Take the limited view seriously', description: 'Drive slowly enough that you can stop immediately.', icon: 'Eye', critical: true },
                  { title: 'Check both sides of the crossing', description: 'Expect someone to emerge suddenly from behind the vehicle.', icon: 'Search' }
                ]
              },
              {
                id: 'rt-bike-lane',
                title: 'Right Turn with Cyclist Beside You',
                situation: 'You want to turn right and there is a cyclist on your right side.',
                steps: [
                  { title: 'Signal and position early', description: 'Signal right and position the car so your intention is clear.', icon: 'ArrowRight' },
                  { title: 'Mirrors + right shoulder check', description: 'Check the right rear area immediately before turning.', icon: 'Eye', critical: true },
                  { title: 'Let the cyclist pass', description: 'If the cyclist has priority or continues straight, wait.', icon: 'AlertTriangle', critical: true }
                ]
              },
              {
                id: 'rt-pedestrian-green',
                title: 'Right Turn on Green with Pedestrians',
                situation: 'You have green, but pedestrians are crossing the destination street.',
                steps: [
                  { title: 'Green does not mean free passage', description: 'Even on green, you must yield to pedestrians crossing your destination road.', icon: 'Info' },
                  { title: 'Stop before turning if necessary', description: 'Stay calm and wait until the crossing is clear.', icon: 'CheckCircle', critical: true }
                ]
              },
              {
                id: 'park-tight-space',
                title: 'Tight Parallel Parking Space',
                situation: 'The parking space is tight but still realistic for the exam.',
                steps: [
                  { title: 'Assess the space consciously', description: 'Calmly decide whether the space is suitable. If in doubt, drive on rather than fail in a rush.', icon: 'Search' },
                  { title: 'Make your observation visible', description: 'Clearly perform mirror checks and a shoulder check before reversing.', icon: 'Eye', critical: true },
                  { title: 'Correct if needed', description: 'A clean correction is better than forcing it in incorrectly.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'park-no-stopping-zone',
                title: 'Open Space in No-Stopping Zone',
                situation: 'You see an open space, but there is a strict no-stopping sign.',
                steps: [
                  { title: 'Prioritize traffic signs', description: 'Even if the space looks perfect, you are not allowed to stop there.', icon: 'Slash', critical: true },
                  { title: 'Search for an alternative', description: 'Drive on calmly and explain the reason to the examiner.', icon: 'Navigation' }
                ]
              },
              {
                id: 'hwy-strong-acceleration',
                title: 'Briskly Entering the Highway',
                situation: 'You are on the acceleration lane.',
                steps: [
                  { title: 'Distance to the car in front', description: 'Leave enough space to be able to accelerate yourself.', icon: 'ArrowUp' },
                  { title: 'Signal left and full throttle', description: 'Use the lane to accelerate to highway speed.', icon: 'Zap', critical: true },
                  { title: 'Mirrors and shoulder check', description: 'Check the left lane and merge smoothly.', icon: 'Eye', critical: true }
                ]
              },
              {
                id: 'hwy-missed-exit',
                title: 'Missed Highway Exit',
                situation: 'You have just missed your planned exit.',
                steps: [
                  { title: 'Never stop or turn around', description: 'Stopping or reversing on the highway is extremely dangerous.', icon: 'AlertTriangle', critical: true },
                  { title: 'Continue to the next exit', description: 'Stay calm and simply take the next regular exit.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'country-forest-area',
                title: 'Forest Route with Risk of Wild Animals',
                situation: 'You are driving on a country road through a forest area.',
                steps: [
                  { title: 'Adjust speed', description: 'Drive more carefully, especially at dawn or dusk.', icon: 'Circle' },
                  { title: 'Watch the roadside', description: 'Look for glowing eyes or movement in the bushes.', icon: 'Search' },
                  { title: 'Dim high beams for oncoming traffic', description: 'Dim your lights in time so as not to endanger others.', icon: 'Eye' }
                ]
              },
              {
                id: 'country-narrow-curve',
                title: 'Blind Curve on a Country Road',
                situation: 'There is a tight, blind right-hand curve ahead of you.',
                steps: [
                  { title: 'Reduce speed before the curve', description: 'Brake in good time before entering the curve.', icon: 'Circle' },
                  { title: 'Strictly keep to the right', description: 'Stay well to the right in case oncoming traffic cuts the corner.', icon: 'ArrowRight', critical: true }
                ]
              },
              {
                id: 'night-pedestrian',
                title: 'Pedestrian in the Dark',
                situation: 'A person in dark clothing is crossing the road at night.',
                steps: [
                  { title: 'Active scanning', description: 'Look specifically for shadows and movement at the edge of the road.', icon: 'Search' },
                  { title: 'Dim high beams', description: 'Switch to low beams if you see someone to avoid blinding them.', icon: 'Eye' },
                  { title: 'Stay ready to brake', description: 'Be prepared to stop immediately if they step onto the road.', icon: 'AlertTriangle', critical: true }
                ]
              },
              {
                id: 'city-lane-change-dense',
                title: 'Lane Change in Dense Traffic',
                situation: 'Heavy traffic, small gaps. You need to change lanes to turn.',
                steps: [
                  { title: 'Signal early', description: 'Give other road users time to recognize your intention.', icon: 'ArrowLeft' },
                  { title: 'Adjust speed', description: 'Try to match the speed of the target lane.', icon: 'Activity' },
                  { title: 'Shoulder check!', description: 'Check the blind spot immediately before changing.', icon: 'Eye', critical: true },
                  { title: 'Merge decisively', description: 'Use the gap firmly once it is large enough.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'hwy-short-ramp',
                title: 'Short Acceleration Lane',
                situation: 'The ramp is extremely short. You must reach highway speed quickly.',
                steps: [
                  { title: 'Accelerate in the curve', description: 'Use every opportunity to build speed early.', icon: 'Zap' },
                  { title: 'Observe early', description: 'Scan highway traffic even before reaching the acceleration lane.', icon: 'Search', critical: true },
                  { title: 'Full acceleration', description: 'Use the entire lane to match the speed.', icon: 'ArrowUp', critical: true }
                ]
              },
              {
                id: 'hwy-truck-right-lane',
                title: 'Truck on the Right Lane',
                situation: 'A truck is driving on the right. You must decide: merge ahead or behind?',
                steps: [
                  { title: 'Estimate truck speed', description: 'Is the truck driving slowly or at a steady 80 km/h?', icon: 'Search' },
                  { title: 'Choose a gap', description: 'Decide early whether to go ahead of or behind the truck.', icon: 'CheckCircle', critical: true },
                  { title: 'Maintain distance', description: 'Check your safety distance immediately after merging.', icon: 'AlertTriangle' }
                ]
              },
              {
                id: 'vc-engine-hood',
                title: 'Opening the Bonnet/Hood',
                situation: 'The examiner asks you to open the engine hood.',
                steps: [
                  { title: 'Release in the interior', description: 'Pull the lever in the footwell (usually driver\'s side).', icon: 'Settings' },
                  { title: 'Release the safety catch', description: 'Push the safety hook at the front center to the side or up.', icon: 'CheckCircle', critical: true },
                  { title: 'Secure the hood', description: 'Secure the hood with the prop rod or check if it is held by gas struts.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'vc-tire-check',
                title: 'Checking the Tyres',
                situation: 'Check the condition of the tyres.',
                steps: [
                  { title: 'Tread depth (Min. 1.6 mm)', description: 'Check the tread (Tip: 1.6 mm is legal, 3-4 mm is recommended).', icon: 'Settings' },
                  { title: 'Look for damage', description: 'Check for cracks, bulges, or foreign objects in the tyre.', icon: 'Eye', critical: true },
                  { title: 'Mention air pressure', description: 'Mention that the pressure must be checked regularly when cold.', icon: 'CheckCircle' }
                ]
              },
              {
                id: 'rvl-hidden-right',
                title: 'Hidden Right-before-Left Intersection',
                situation: 'In narrow residential areas or 30-zones, side streets from the right are often hidden by parked cars or hedges. Driving too fast here risks a priority violation.',
                steps: [
                  { title: 'Approach at reduced speed', description: 'Take your foot off the gas early and stay ready to brake.', icon: 'ArrowDown' },
                  { title: 'Active scanning to the right', description: 'Turn your head clearly to the right, even if the intersection still seems hidden.', icon: 'Eye', critical: true },
                  { title: 'Yield to traffic from the right', description: 'Stop for vehicles coming from the right and let them pass.', icon: 'AlertTriangle', critical: true }
                ]
              },
            ],
            vehicleCheckVisuals: [
              {
                id: 'visual-dipstick',
                code: 'CHECK',
                title: 'Oil Dipstick',
                description: 'Check engine oil level between min and max. Explain the check on level ground and with the engine switched off.'
              },
              {
                id: 'visual-tyre',
                code: '1.6 MM',
                title: 'Tyre Tread',
                description: 'Legal minimum tread depth: 1.6 mm. In the exam, also mention condition, damage, and air pressure.'
              },
              {
                id: 'visual-dashboard',
                code: 'ROT / GELB',
                title: 'Warning Lights',
                description: 'Green/blue = active, yellow = warning, red = act immediately. Examiners often ask about meaning and response.'
              },
              {
                id: 'visual-lights',
                code: 'LIGHTS',
                title: 'Lighting Check',
                description: 'Know dipped beam, indicators, brake lights, hazard lights, and rear fog light, and be able to explain how to check them.'
              }
            ],
            vehicleCheckScenarios: [
              {
                id: 'vehicle-check-oil-dipstick',
                title: 'Examiner asks: “Show me how to check the engine oil.”',
                situation: 'You are standing at the vehicle and must explain and show the correct oil-level check.',
                steps: [
                  { title: 'Open and secure the bonnet', description: 'Use the interior release, unlock the safety latch under the bonnet, and open the bonnet safely or secure it with the support rod.' },
                  { title: 'Identify and pull out the dipstick', description: 'Locate the dipstick, pull it out fully, and wipe it with a cloth.' },
                  { title: 'Reinsert and read the level', description: 'Insert the dipstick fully, pull it out again, and check whether the level is between minimum and maximum.' },
                  { title: 'Explain it correctly', description: 'Also explain: too little oil can damage the engine, and too much oil is also problematic. If necessary, top up with the correct oil according to manufacturer specification.' }
                ],
                mistakes: [
                  { id: 'oil-mistake-1', title: 'Only pointing at parts', content: 'The examiner usually expects a short explanation of the process, not silent pointing only.' }
                ]
              },
              {
                id: 'vehicle-check-tyres',
                title: 'Examiner asks about tyre tread and condition',
                situation: 'You must explain what to check on a tyre and what minimum tread depth is legally required.',
                steps: [
                  { title: 'State the tread requirement', description: 'Explain: The legal minimum is 1.6 mm tread. Clearly more is sensible for safety in wet conditions.' },
                  { title: 'Look for damage', description: 'Check for cracks, bulges, embedded objects, and uneven wear.' },
                  { title: 'Mention tyre pressure', description: 'Tyre pressure must match load and manufacturer specifications. Pressure that is too low or too high worsens handling and braking distance.' }
                ]
              },
              {
                id: 'vehicle-check-dashboard',
                title: 'Examiner asks about dashboard warning lights',
                situation: 'You are sitting in the vehicle and must explain common indicator and warning lights.',
                steps: [
                  { title: 'Interpret colours correctly', description: 'Green/blue = function active, yellow = warning, red = urgent problem or immediate action required.' },
                  { title: 'Give examples', description: 'For example: indicators, high beam, engine warning light, oil pressure, battery, ABS, brake system, airbag.' },
                  { title: 'Take red warnings seriously', description: 'Explain that red warning lights must be assessed immediately and that you may not simply continue driving depending on the symbol.' }
                ]
              },
              {
                id: 'vehicle-check-lights',
                title: 'Examiner asks: “How do you check the lights?”',
                situation: 'You must describe how to check the lights - even if you are alone.',
                steps: [
                  { title: 'Know the controls', description: 'Show where the light switch, rear fog light, hazard lights, and where applicable headlight adjustment are controlled.' },
                  { title: 'Explain the external check', description: 'Dipped beam, indicators, brake lights, and tail lights can be checked with a helper or via reflection from a wall or shop window.' },
                  { title: 'Mention clean lenses', description: 'Lights must not only work, but also be clean and undamaged.' }
                ]
              },
              {
                id: 'vehicle-check-safety-equipment',
                title: 'Examiner asks about warning triangle and first-aid kit',
                situation: 'You must identify and show safety equipment in the vehicle.',
                steps: [
                  { title: 'Identify the location', description: 'Name or show the storage location of the warning triangle, safety vests, and first-aid kit.' },
                  { title: 'Explain the purpose', description: 'Briefly explain what the items are for and that they should be quickly accessible in an emergency.' },
                  { title: 'Stay calm', description: 'If your driving school car stores them in an unusual place, think calmly and search systematically instead of guessing in a rush.' }
                ]
              }
            ],
    },
  },
};
