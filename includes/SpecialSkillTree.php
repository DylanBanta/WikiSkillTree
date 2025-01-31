<?php

class SpecialSkillTree extends SpecialPage {
    public function __construct() {
        parent::__construct( 'SkillTree' );
    }

    public function execute( $subPage ) {
        $this->setHeaders();
        $out = $this->getOutput();
        $out->addModules( 'ext.skilltree' );

        // Sample container for D3.js rendering
        $out->addHTML( '<div id="skill-tree-container-tree"></div><br/><div id="skill-tree-container-force"></div>' );
    }
}
