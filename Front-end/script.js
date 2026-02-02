function showCourse() 
{
    const select = document.getElementById('courses');
    const display = document.getElementById('selectedCourse');
    const proceedBtn = document.getElementById('proceedBtn');
    display.textContent = select.value ? `You selected: ${select.options[select.selectedIndex].text}` : '';
    // enable proceed only when both an action and course are chosen
    const anySelectedAction = document.querySelector('.option-btn[aria-pressed="true"]');
    proceedBtn.disabled = !select.value || !anySelectedAction;
}

// Option buttons: pick an action (rent/return) and prompt user to choose course
document.addEventListener('DOMContentLoaded', () => {
    const optionBtns = document.querySelectorAll('.option-btn');
    const proceedBtn = document.getElementById('proceedBtn');
    const clearBtn = document.getElementById('clearSelectionBtn');
    const select = document.getElementById('courses');
    const actionHint = document.getElementById('actionHint');

    // Prefill from previous selection if present
    const prevAction = localStorage.getItem('selectedAction');
    const prevCourseName = localStorage.getItem('selectedCourseName');
    const prevCourseCode = localStorage.getItem('selectedCourseCode');
    if (prevAction) {
        const btn = Array.from(optionBtns).find(b => b.dataset.action === prevAction);
        if (btn) {
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('selected');
            if (actionHint) actionHint.textContent = `Selected action: ${prevAction === 'return' ? 'Return' : 'Rent/Browse'}.`;
        }
    }
    if (prevCourseCode && select) {
        select.value = prevCourseCode;
        if (prevCourseName) {
            const display = document.getElementById('selectedCourse');
            display.textContent = `You selected: ${prevCourseName}`;
        }
    }

    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // set this as the active action
            optionBtns.forEach(b => {
                b.setAttribute('aria-pressed', 'false');
                b.classList.remove('selected');
            });
            btn.setAttribute('aria-pressed', 'true');
            btn.classList.add('selected');

            const action = btn.dataset.action;
            if (actionHint) actionHint.textContent = `Selected action: ${action === 'return' ? 'Return' : 'Rent/Browse'}. Now choose a course below.`;

            // if a course was already chosen, enable proceed
            proceedBtn.disabled = !select.value;

            // focus the course select to encourage choosing one
            select.focus();
        });
    });

    // When Proceed clicked, save selection to localStorage and navigate to the chosen page
    proceedBtn.addEventListener('click', () => {
        const selectedAction = document.querySelector('.option-btn[aria-pressed="true"]')?.dataset.action;
        const courseCode = select.value;
        const courseName = select.options[select.selectedIndex]?.text || '';
        if (!selectedAction || !courseCode) return;
        localStorage.setItem('selectedAction', selectedAction);
        localStorage.setItem('selectedCourseCode', courseCode);
        localStorage.setItem('selectedCourseName', courseName);
        const target = selectedAction === 'return' ? 'return.html' : 'rent.html';
        window.location.href = target;
    });

    clearBtn.addEventListener('click', () => {
        optionBtns.forEach(b => {
            b.setAttribute('aria-pressed', 'false');
            b.classList.remove('selected');
        });
        select.value = '';
        document.getElementById('selectedCourse').textContent = '';
        if (actionHint) actionHint.textContent = '';
        document.getElementById('proceedBtn').disabled = true;
        localStorage.removeItem('selectedAction');
        localStorage.removeItem('selectedCourseCode');
        localStorage.removeItem('selectedCourseName');
    });

    // ----- Form handling (rent + return) -----
    function validateStudentNumber(val) {
        return /^\d+$/.test(String(val).trim());
    }

    // Rental form
    const rentalForm = document.getElementById('rentalForm');
    if (rentalForm) {
        const studentInput = document.getElementById('student');
        const studentNumber = document.getElementById('studentNumber');
        const textbookSelect = document.getElementById('textbook');
        const studentError = document.getElementById('studentNumberError');
        const confirmation = document.getElementById('confirmation');

        rentalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            studentError.textContent = '';
            studentNumber.classList.remove('invalid');
            confirmation.style.display = 'none';
            confirmation.textContent = '';

            const name = studentInput.value.trim();
            const number = studentNumber.value.trim();
            const textbook = textbookSelect.options[textbookSelect.selectedIndex]?.text || '';
            const courseName = localStorage.getItem('selectedCourseName') || document.getElementById('selectedCourseDisplay')?.textContent || '';

            if (!validateStudentNumber(number)) {
                studentError.textContent = 'Invalid student number. Please enter numbers only.';
                studentNumber.classList.add('invalid');
                studentNumber.focus();
                return;
            }
            // all good -> show confirmation with actions
            const msgRent = `Success! "${textbook}" rented for ${courseName}. Student: ${name} (${number}).`;
            confirmation.innerHTML = `
                <div class="confirmation-content">${msgRent}</div>
                <div class="confirmation-actions">
                    <button type="button" id="backHomeBtn" class="action-btn">Back to Home</button>
                    <button type="button" id="exitBtn" class="action-btn secondary">Exit</button>
                </div>
            `;
            confirmation.style.display = 'block';
            confirmation.tabIndex = -1;
            confirmation.focus();

            const backHomeBtn = document.getElementById('backHomeBtn');
            const exitBtn = document.getElementById('exitBtn');

            function clearAndGoHome() {
                localStorage.removeItem('selectedAction');
                localStorage.removeItem('selectedCourseCode');
                localStorage.removeItem('selectedCourseName');
                window.location.href = 'index.html';
            }

            let redirectTimer = setTimeout(() => {
                clearAndGoHome();
            }, 4000);

            if (backHomeBtn) {
                backHomeBtn.addEventListener('click', () => {
                    clearAndGoHome();
                    clearTimeout(redirectTimer);
                });
            }
            if (exitBtn) {
                exitBtn.addEventListener('click', () => {
                    clearTimeout(redirectTimer);
                    try {
                        window.close();
                        // fallback
                        setTimeout(() => {
                            window.location.href = 'about:blank';
                        }, 200);
                    } catch (err) {
                        window.location.href = 'about:blank';
                    }
                });
            }

            rentalForm.reset();
        });
    }

    // Return form
    const returnForm = document.getElementById('returnForm');
    if (returnForm) {
        const studentInput = document.getElementById('student');
        const studentNumber = document.getElementById('studentNumber');
        const returnSelect = document.getElementById('returnBook');
        const studentError = document.getElementById('studentNumberError');
        const confirmation = document.getElementById('confirmation');

        returnForm.addEventListener('submit', (e) => {
            e.preventDefault();
            studentError.textContent = '';
            studentNumber.classList.remove('invalid');
            confirmation.style.display = 'none';
            confirmation.textContent = '';

            const name = studentInput.value.trim();
            const number = studentNumber.value.trim();
            const book = returnSelect.options[returnSelect.selectedIndex]?.text || '';
            const courseName = localStorage.getItem('selectedCourseName') || document.getElementById('selectedCourseDisplay')?.textContent || '';

            if (!validateStudentNumber(number)) {
                studentError.textContent = 'Invalid student number. Please enter numbers only.';
                studentNumber.classList.add('invalid');
                studentNumber.focus();
                return;
            }
            const msgReturn = `Success! "${book}" returned for ${courseName}. Student: ${name} (${number}).`;
            confirmation.innerHTML = `
                <div class="confirmation-content">${msgReturn}</div>
                <div class="confirmation-actions">
                    <button type="button" id="backHomeBtn" class="action-btn">Back to Home</button>
                    <button type="button" id="exitBtn" class="action-btn secondary">Exit</button>
                </div>
            `;
            confirmation.style.display = 'block';
            confirmation.tabIndex = -1;
            confirmation.focus();

            const backHomeBtn = document.getElementById('backHomeBtn');
            const exitBtn = document.getElementById('exitBtn');

            function clearAndGoHome() {
                localStorage.removeItem('selectedAction');
                localStorage.removeItem('selectedCourseCode');
                localStorage.removeItem('selectedCourseName');
                window.location.href = 'index.html';
            }

            let redirectTimer = setTimeout(() => {
                clearAndGoHome();
            }, 4000);

            if (backHomeBtn) {
                backHomeBtn.addEventListener('click', () => {
                    clearAndGoHome();
                    clearTimeout(redirectTimer);
                });
            }
            if (exitBtn) {
                exitBtn.addEventListener('click', () => {
                    clearTimeout(redirectTimer);
                    try {
                        window.close();
                        // fallback
                        setTimeout(() => {
                            window.location.href = 'about:blank';
                        }, 200);
                    } catch (err) {
                        window.location.href = 'about:blank';
                    }
                });
            }
            returnForm.reset();
        });
    }

});