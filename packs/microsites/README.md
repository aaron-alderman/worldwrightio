# Microsites

Requires core. Declare isa Microsite, title, description, reading and a unique safe route such as field-guide.html. Optional place relations link declared Places when the reader is selected, and show plain labels otherwise. microsites.view returns an embeddable set of windows.

For faithful source-tree projection, optional markup references an Encounter-authored document with typed markup: kinds document, element (tag/attributes/children), text, comment, doctype or world-context-name. Children may be inline typed nodes or references to other named documents. Text nodes are escaped. Optional stylesheet references a named Encounter stylesheet document and requires stylesheetRoute. The reusable source.markup/source.css/source.metadata algebra is selected with this pack.

A markup head may opt into runtime and canonical metadata facts on its Microsite subject; metadata requires explicit world.origin and supplied sharing fields. There is no inherited origin, branding, content or early-script special case. Structured windows use the shared shell; an explicit complete source tree controls its own output.

Edit the named markup and stylesheet records in `source/microsites.encounter`. Their REL projection is generated alongside queried route and place facts.
