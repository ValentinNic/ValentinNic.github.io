const filters=document.getElementById('categories');
filters.addEventListener('click',event=>{
  const selected=event.target.closest('button');
  if(!selected)return;
  for(const button of filters.querySelectorAll('button')){
    button.setAttribute('aria-pressed',String(button===selected));
  }
  for(const project of document.querySelectorAll('.project')){
    project.hidden=selected.textContent!=='All projects' && project.dataset.category!==selected.textContent;
  }
});
