import DashTable from 'cypress/DashTable';

describe('delete', () => {
    beforeEach(() => cy.visit('http://localhost:8080'));

    it('can delete row', () => {
        DashTable.getCell(0, 0).within(() => cy.get('.dash-cell-value').should('have.html', '1'));
        DashTable.getDelete(0).click();
        DashTable.getCell(0, 0).within(() => cy.get('.dash-cell-value').should('have.html', '2'));
    });

    it('can delete row when sorted', () => {
        cy.get('tr th.column-0 .sort').last().click({ force: true });
        DashTable.getCell(0, 0).within(() => cy.get('.dash-cell-value').should('have.html', '1'));
        DashTable.getDelete(0).click();
        DashTable.getCell(0, 0).within(() => cy.get('.dash-cell-value').should('have.html', '2'));
    });
});