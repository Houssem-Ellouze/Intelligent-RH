package tn.esprit.employees.entity;


public enum DomainePrincipale {
    DEVELOPPEMENT_WEB("Développement Web"),
    CLOUD("Cloud Computing"),
    DATA_SCIENCE("Data Science"),
    CYBERSECURITE("Cybersécurité"),
    MOBILE("Développement Mobile"),
    DEVOPS("DevOps & Infrastructure"),
    INTELLIGENCE_ARTIFICIELLE("IA & Machine Learning"),
    TEST_ET_QA("Test et Qualité Logicielle"),
    DESIGN_UX_UI("Design UX/UI");

    private final String label;

    // Constructeur pour associer un nom lisible
    DomainePrincipale(String label) {
        this.label = label;
    }

}