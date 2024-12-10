import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
const firebaseConfig={
    apiKey:"AIzaSyDb3U-DKZh1-YePv3rBdMqWLZ_AHGiisfE",
    authDomain:"iapscore-db.firebaseapp.com",
    databaseURL:"https://iapscore-db-default-rtdb.firebaseio.com",
    projectId:"iapscore-db",
    storageBucket:"iapscore-db.firebasestorage.app",
    messagingSenderId:"1087425272767",
    appId:"1:1087425272767:web:1591a49b75ea1835401f0a"
};
const app=initializeApp(firebaseConfig);
const db=getDatabase(app);
const toastSuccessEl=document.getElementById('toast-success');
const toastErrorEl=document.getElementById('toast-error');
const toastSuccess=new bootstrap.Toast(toastSuccessEl);
const toastError=new bootstrap.Toast(toastErrorEl);
const showSuccess=m=>{toastSuccessEl.querySelector('.toast-body').textContent=m;toastSuccess.show();}
const showError=m=>{toastErrorEl.querySelector('.toast-body').textContent=m;toastError.show();}
let ciclos=[];
const camposMonetarios=["faturamento-realizado","faturamento-acelerador"];
const obterValorNumerico=c=>parseFloat(c.value.replace(/\D/g,''))/100||0;
const formatarCampoMonetario=c=>{
    let v=c.value.replace(/\D/g,'')||'0';
    let n=parseInt(v,10)||0;
    n=n/100;
    c.value=n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    c.selectionStart=c.selectionEnd=c.value.length;
};
const gerarHTMLCiclo=(index,c)=>{
    return `
    <div class="card" data-index="${index}">
        <div class="card-header">
            <span>Ciclo ${index+1}</span>
            <div class="d-flex gap-2">
                <button type="button" id="btn-salvar-dados-${index}" class="btn btn-primary d-inline-flex align-items-center">
                    <i class="bi bi-save me-2"></i>Salvar Dados
                </button>
                <button type="button" id="btn-limpar-ciclo-${index}" class="btn btn-warning d-inline-flex align-items-center">
                    <i class="bi bi-arrow-counterclockwise me-2"></i>Limpar Ciclo
                </button>
                <button type="button" class="btn btn-secondary toggle-collapse d-inline-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="true" aria-controls="collapse-${index}">
                    <i class="bi bi-chevron-up"></i>
                </button>
            </div>
        </div>
        <div class="collapse show" id="collapse-${index}">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-bordered align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th><i class="bi bi-graph-up text-primary me-1"></i>Indicador</th>
                                <th><i class="bi bi-funnel text-secondary me-1"></i>Sub-Indicador</th>
                                <th><i class="bi bi-bar-chart-fill text-success me-1"></i>Resultado</th>
                                <th><i class="bi bi-star-fill text-warning me-1"></i>Pontos</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><i class="bi bi-cash-stack text-info me-1"></i>Faturamento</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="text" id="faturamento-realizado" class="form-control" placeholder="Realizado" required value="${(c.FaturamentoRealizado||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}">
                                        <input type="text" id="faturamento-acelerador" class="form-control" placeholder="Acelerador" required value="${(c.FaturamentoAcelerador||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-faturamento" class="form-control" readonly value="0%"></td>
                                <td id="pontos-faturamento" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td><i class="bi bi-person-check text-info me-1"></i>Ativas</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="number" id="ativas-realizado" class="form-control" placeholder="Realizado" step="1" min="0" required value="${c.AtivasRealizado||0}">
                                        <input type="number" id="ativas-acelerador" class="form-control" placeholder="Acelerador" step="1" min="0" required value="${c.AtivasAcelerador||0}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-ativas" class="form-control" readonly value="0%"></td>
                                <td id="pontos-ativas" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td><i class="bi bi-card-checklist text-info me-1"></i>Cadastro Prata+</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="number" id="cadastro-prata-realizado" class="form-control" placeholder="Realizado" step="1" min="0" required value="${c.CadastroPrataRealizado||0}">
                                        <input type="number" id="cadastro-prata-acelerador" class="form-control" placeholder="Acelerador" step="1" min="0" required value="${c.CadastroPrataAcelerador||0}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-cadastro-prata" class="form-control" readonly value="0%"></td>
                                <td id="pontos-cadastro-prata" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td><i class="bi bi-wallet text-info me-1"></i>Saldo</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="number" id="qtd-inicios" class="form-control" placeholder="Qtd Inícios" step="1" min="0" required value="${c.QtdInicios||0}">
                                        <input type="number" id="qtd-cessadas" class="form-control" placeholder="Qtd Cessadas" step="1" min="0" required value="${c.QtdCessadas||0}">
                                        <input type="number" id="ciclos" class="form-control" placeholder="Ciclos" step="1" min="1" required value="${c.Ciclos||1}">
                                        <input type="number" id="grupos" class="form-control" placeholder="Grupos" step="1" min="1" required value="${c.Grupos||1}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-saldo" class="form-control" readonly value="0.00"></td>
                                <td id="pontos-saldo" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td><i class="bi bi-people-fill text-info me-1"></i>Ativas Crer Para Ver</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="number" id="ativas-cpv-realizado" class="form-control" placeholder="Realizado" step="1" min="0" required value="${c.AtivasCPVRealizado||0}">
                                        <input type="number" id="ativas-cpv-acelerador" class="form-control" placeholder="Acelerador" step="1" min="0" required value="${c.AtivasCPVAcelerador||0}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-ativas-cpv" class="form-control" readonly value="0%"></td>
                                <td id="pontos-ativas-cpv" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td><i class="bi bi-people text-info me-1"></i>Ativas Mistas</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="number" id="ativas-mistas-realizado" class="form-control" placeholder="Realizado" step="1" min="0" required value="${c.AtivasMistasRealizado||0}">
                                        <input type="number" id="ativas-mistas-acelerador" class="form-control" placeholder="Acelerador" step="1" min="0" required value="${c.AtivasMistasAcelerador||0}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-ativas-mistas" class="form-control" readonly value="0%"></td>
                                <td id="pontos-ativas-mistas" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td><i class="bi bi-award-fill text-info me-1"></i>Líderes em IAP</td>
                                <td>
                                    <div class="sub-indicador-container">
                                        <input type="number" id="total-lideres-iap" class="form-control" placeholder="Total Líderes" step="1" min="0" required value="${c.TotalLideresIAP||0}">
                                        <input type="number" id="lideres-com-pontos" class="form-control" placeholder="Líderes com >7 Pontos" step="1" min="0" required value="${c.LideresComPontos||0}">
                                    </div>
                                </td>
                                <td><input type="text" id="resultado-lideres-iap" class="form-control" readonly value="0%"></td>
                                <td id="pontos-lideres-iap" class="text-center">0</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-start bg-light">
                                    <h2 class="pontuacao-final">Pontuação do Ciclo ${index+1}:</h2>
                                </td>
                                <td class="text-center bg-light">
                                    <span id="pontuacao" class="text-warning">0.00</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>`;
};
const atualizarSaldo=card=>{
    const qtdInicios=parseInt(card.querySelector("#qtd-inicios").value,10)||0;
    const qtdCessadas=parseInt(card.querySelector("#qtd-cessadas").value,10)||0;
    const cicloVal=parseInt(card.querySelector("#ciclos").value,10)||1;
    const grupoVal=parseInt(card.querySelector("#grupos").value,10)||1;
    let saldo=0;
    if(cicloVal>0&&grupoVal>0) saldo=((qtdInicios - qtdCessadas)/cicloVal)/grupoVal;
    card.querySelector("#resultado-saldo").value=saldo.toFixed(2);
};
const calcularPontuacao=card=>{
    const faturamentoRealizado=obterValorNumerico(card.querySelector("#faturamento-realizado"));
    const faturamentoAcelerador=obterValorNumerico(card.querySelector("#faturamento-acelerador"));
    let pf=faturamentoAcelerador?(faturamentoRealizado/faturamentoAcelerador)*100:0;
    card.querySelector("#resultado-faturamento").value=`${pf.toFixed(2)}%`;
    let pF=0;if(pf>=102.5)pF=4;else if(pf>=97.5)pF=2;
    card.querySelector("#pontos-faturamento").innerText=pF;
    const ativasRealizado=parseInt(card.querySelector("#ativas-realizado").value,10)||0;
    const ativasAcelerador=parseInt(card.querySelector("#ativas-acelerador").value,10)||0;
    let pa=ativasAcelerador?(ativasRealizado/ativasAcelerador)*100:0;
    card.querySelector("#resultado-ativas").value=`${pa.toFixed(2)}%`;
    let pA=0;if(pa>=102.5)pA=4;else if(pa>=97.5)pA=2;
    card.querySelector("#pontos-ativas").innerText=pA;
    const cpRealizado=parseInt(card.querySelector("#cadastro-prata-realizado").value,10)||0;
    const cpAcelerador=parseInt(card.querySelector("#cadastro-prata-acelerador").value,10)||0;
    let pcp=cpAcelerador?(cpRealizado/cpAcelerador)*100:0;
    card.querySelector("#resultado-cadastro-prata").value=`${pcp.toFixed(2)}%`;
    let pCP=0;if(pcp>=102.5)pCP=2;else if(pcp>=97.5)pCP=1;
    card.querySelector("#pontos-cadastro-prata").innerText=pCP;
    atualizarSaldo(card);
    const saldo=parseFloat(card.querySelector("#resultado-saldo").value)||0;
    let pS=0;if(saldo>=1)pS=2;else if(saldo>=0)pS=1;
    card.querySelector("#pontos-saldo").innerText=pS;
    const cpvRealizado=parseInt(card.querySelector("#ativas-cpv-realizado").value,10)||0;
    const cpvAcelerador=parseInt(card.querySelector("#ativas-cpv-acelerador").value,10)||0;
    let pacpv=cpvAcelerador?(cpvRealizado/cpvAcelerador)*100:0;
    card.querySelector("#resultado-ativas-cpv").value=`${pacpv.toFixed(2)}%`;
    let pCPV=0;if(pacpv>=102.5)pCPV=2;else if(pacpv>=97.5)pCPV=1;
    card.querySelector("#pontos-ativas-cpv").innerText=pCPV;
    const mRealizado=parseInt(card.querySelector("#ativas-mistas-realizado").value,10)||0;
    const mAcelerador=parseInt(card.querySelector("#ativas-mistas-acelerador").value,10)||0;
    let pam=mAcelerador?(mRealizado/mAcelerador)*100:0;
    card.querySelector("#resultado-ativas-mistas").value=`${pam.toFixed(2)}%`;
    let pM=0;if(pam>=102.5)pM=2;else if(pam>=97.5)pM=1;
    card.querySelector("#pontos-ativas-mistas").innerText=pM;
    const tl=parseInt(card.querySelector("#total-lideres-iap").value,10)||0;
    const lc=parseInt(card.querySelector("#lideres-com-pontos").value,10)||0;
    let pli=tl?(lc/tl)*100:0;
    card.querySelector("#resultado-lideres-iap").value=`${pli.toFixed(2)}%`;
    let pL=0;if(pli>=90)pL=2;else if(pli>=75)pL=1;
    card.querySelector("#pontos-lideres-iap").innerText=pL;
    const pontuacao=pF+pA+pCP+pS+pCPV+pM+pL;
    card.querySelector("#pontuacao").innerText=isNaN(pontuacao)?"Erro":pontuacao.toFixed(2);
};
const eventosCiclo=card=>{
    card.querySelectorAll("input").forEach(e=>{
        if(camposMonetarios.includes(e.id)){
            e.addEventListener("input",()=>{
                formatarCampoMonetario(e);
                calcularPontuacao(card);
            });
        }else{
            e.addEventListener("input",()=>calcularPontuacao(card));
        }
    });
    const index=parseInt(card.dataset.index,10);
    card.querySelector(`#btn-salvar-dados-${index}`).addEventListener("click",()=>{
        salvarCiclo(index);
    });
    card.querySelector(`#btn-limpar-ciclo-${index}`).addEventListener("click",()=>{
        limparCiclo(index);
    });
    card.querySelector('.toggle-collapse').addEventListener('click',()=>{
        const icon=card.querySelector('.toggle-collapse i');
        if(icon.classList.contains('bi-chevron-up')){
            icon.classList.remove('bi-chevron-up');
            icon.classList.add('bi-chevron-down');
        } else {
            icon.classList.remove('bi-chevron-down');
            icon.classList.add('bi-chevron-up');
        }
    });
    calcularPontuacao(card);
};
const salvarCiclo=idx=>{
    ciclos[idx]={
        FaturamentoRealizado:obterValorNumerico(document.querySelector(`.card[data-index="${idx}"] #faturamento-realizado`)),
        FaturamentoAcelerador:obterValorNumerico(document.querySelector(`.card[data-index="${idx}"] #faturamento-acelerador`)),
        AtivasRealizado:parseInt(document.querySelector(`.card[data-index="${idx}"] #ativas-realizado`).value,10)||0,
        AtivasAcelerador:parseInt(document.querySelector(`.card[data-index="${idx}"] #ativas-acelerador`).value,10)||0,
        CadastroPrataRealizado:parseInt(document.querySelector(`.card[data-index="${idx}"] #cadastro-prata-realizado`).value,10)||0,
        CadastroPrataAcelerador:parseInt(document.querySelector(`.card[data-index="${idx}"] #cadastro-prata-acelerador`).value,10)||0,
        QtdInicios:parseInt(document.querySelector(`.card[data-index="${idx}"] #qtd-inicios`).value,10)||0,
        QtdCessadas:parseInt(document.querySelector(`.card[data-index="${idx}"] #qtd-cessadas`).value,10)||0,
        Ciclos:parseInt(document.querySelector(`.card[data-index="${idx}"] #ciclos`).value,10)||1,
        Grupos:parseInt(document.querySelector(`.card[data-index="${idx}"] #grupos`).value,10)||1,
        AtivasCPVRealizado:parseInt(document.querySelector(`.card[data-index="${idx}"] #ativas-cpv-realizado`).value,10)||0,
        AtivasCPVAcelerador:parseInt(document.querySelector(`.card[data-index="${idx}"] #ativas-cpv-acelerador`).value,10)||0,
        AtivasMistasRealizado:parseInt(document.querySelector(`.card[data-index="${idx}"] #ativas-mistas-realizado`).value,10)||0,
        AtivasMistasAcelerador:parseInt(document.querySelector(`.card[data-index="${idx}"] #ativas-mistas-acelerador`).value,10)||0,
        TotalLideresIAP:parseInt(document.querySelector(`.card[data-index="${idx}"] #total-lideres-iap`).value,10)||0,
        LideresComPontos:parseInt(document.querySelector(`.card[data-index="${idx}"] #lideres-com-pontos`).value,10)||0
    };
    set(ref(db,"dados/ciclos"),ciclos).then(()=>showSuccess("Dados salvos com sucesso!")).catch(()=>showError("Erro ao salvar."));
};
const limparCiclo=idx=>{
    ciclos[idx]={
        FaturamentoRealizado:0,
        FaturamentoAcelerador:0,
        AtivasRealizado:0,
        AtivasAcelerador:0,
        CadastroPrataRealizado:0,
        CadastroPrataAcelerador:0,
        QtdInicios:0,
        QtdCessadas:0,
        Ciclos:1,
        Grupos:1,
        AtivasCPVRealizado:0,
        AtivasCPVAcelerador:0,
        AtivasMistasRealizado:0,
        AtivasMistasAcelerador:0,
        TotalLideresIAP:0,
        LideresComPontos:0
    };
    renderCiclos();
};
const renderCiclos=()=>{
    const cont=document.getElementById("ciclos-container");
    cont.innerHTML="";
    ciclos.forEach((c,i)=>{
        cont.insertAdjacentHTML('beforeend',gerarHTMLCiclo(i,c));
    });
    cont.querySelectorAll(".card").forEach(card=>eventosCiclo(card));
};
const salvar=()=>{
    set(ref(db,"dados/ciclos"),ciclos).then(()=>showSuccess("Dados salvos com sucesso!")).catch(()=>showError("Erro ao salvar."));
};
const adicionarCiclo=()=>{
    ciclos.push({
        FaturamentoRealizado:0,
        FaturamentoAcelerador:0,
        AtivasRealizado:0,
        AtivasAcelerador:0,
        CadastroPrataRealizado:0,
        CadastroPrataAcelerador:0,
        QtdInicios:0,
        QtdCessadas:0,
        Ciclos:1,
        Grupos:1,
        AtivasCPVRealizado:0,
        AtivasCPVAcelerador:0,
        AtivasMistasRealizado:0,
        AtivasMistasAcelerador:0,
        TotalLideresIAP:0,
        LideresComPontos:0
    });
    renderCiclos();
};
const removerCiclo=()=>{
    if(ciclos.length>1){
        ciclos.pop();
        renderCiclos();
    }
};
document.getElementById("btn-adicionar-ciclo").addEventListener("click",adicionarCiclo);
document.getElementById("btn-remover-ciclo").addEventListener("click",removerCiclo);
onValue(ref(db,"dados/ciclos"),snapshot=>{
    const val=snapshot.val();
    if(val&&Array.isArray(val)&&val.length>0){
        ciclos=val;
    } else {
        ciclos=[{
            FaturamentoRealizado:0,
            FaturamentoAcelerador:0,
            AtivasRealizado:0,
            AtivasAcelerador:0,
            CadastroPrataRealizado:0,
            CadastroPrataAcelerador:0,
            QtdInicios:0,
            QtdCessadas:0,
            Ciclos:1,
            Grupos:1,
            AtivasCPVRealizado:0,
            AtivasCPVAcelerador:0,
            AtivasMistasRealizado:0,
            AtivasMistasAcelerador:0,
            TotalLideresIAP:0,
            LideresComPontos:0
        }];
    }
    renderCiclos();
});