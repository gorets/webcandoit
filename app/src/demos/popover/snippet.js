const popover = document.querySelector('#my-popover');

popover.showPopover();
popover.hidePopover();
popover.togglePopover();

popover.addEventListener('toggle', (event) => {
  console.log(event.newState);
});
