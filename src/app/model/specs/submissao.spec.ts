import { AngularFirestore, AngularFirestoreModule } from "@angular/fire/firestore";

import { TestBed, inject } from "@angular/core/testing";

import { DocumentModule } from "../firestore/document.module";

import { AngularFireModule, FirebaseApp } from "@angular/fire";

import { FirebaseConfiguracao } from "src/environments/firebase";
import Submissao from '../submissao';
import Estudante from '../estudante';
import { Questao } from '../questao';
import Erro from '../erro';
import { TipoErro } from '../tipoErro';
import { forkJoin } from 'rxjs';
import Usuario from '../usuario';

describe("Testes de Submissão", ()=>{

    let app: firebase.app.App;
    let afs: AngularFirestore;


    beforeAll(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 1200000;
        TestBed.configureTestingModule({
            imports: [
                DocumentModule,
                AngularFireModule.initializeApp(FirebaseConfiguracao),
                AngularFirestoreModule//.enablePersistence()
            ]
        });
        inject([FirebaseApp, AngularFirestore], (_app: firebase.app.App, _afs: AngularFirestore) => {

            app = _app;
            afs = _afs;
        })();

    });

    it("Deve carregar uma submissão com erro", (done)=>{
        let algoritmo = "x = 2\ny = c";
        let estudante = new Usuario("CvsVQsPKIExzNWFh2TWW", null, null, null);
        let questao = new Questao("LwC2ItAVtfkDhcE9jvpT", null, null, null, null, null, null, []);
        let submissao = new Submissao(null, algoritmo, estudante, questao);
        let x = submissao.erros;
        submissao.save().subscribe(resultado=>{
            let erro = new Erro(null, 2, null, TipoErro.variavelNaoDeclarada, resultado);
            erro.save().subscribe(erroCadastrado=>{
                Submissao.get(resultado.id).subscribe(resultadoSubmissao=>{
                    let x = resultadoSubmissao["erros"];
                    expect(resultadoSubmissao["erros"].length).toEqual(1);
                    forkJoin([Submissao.delete(submissao.pk()), Erro.delete(erro.pk())]).subscribe(r=>{
                        done();
                    })
                    
                });
            })
        })
    })

    it("Deve carregar uma submissão mais recente", (done)=>{
        let algoritmo = "x = 2\ny = x";
        let estudante = new Usuario("CvsVQsPKIExzNWFh2TWW", null, null, null);
        let questao = new Questao("LwC2ItAVtfkDhcE9jvpT", null, null, null, null, null, null, []);
        let s1 = new Submissao(null, algoritmo, estudante, questao);
        let s2 = new Submissao(null, algoritmo, estudante, questao);
        let x = s1.erros;
    
        s1.save().subscribe(resultado=>{
            s2.save().subscribe(res=>{
                Submissao.getRecentePorQuestao(questao, estudante).subscribe(submissao=>{
                    expect(submissao["pk"]()).toEqual(s2.pk());
                    forkJoin([Submissao.delete(s1.pk()), Submissao.delete(s2.pk())]).subscribe(r=>{
                        done();
                    })
                    done();
                })
            })
        })
    })

});