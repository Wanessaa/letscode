import { Document, Collection, date } from './firestore/document';
import { Observable } from 'rxjs';
import Query from './firestore/query';
import { sha256 } from 'js-sha256';
import { PerfilUsuario } from './perfilUsuario';


@Collection("usuarios")
export default class Usuario extends Document{

    @date()
    database;

    constructor(id, public email, public senha, public perfil:PerfilUsuario) {
        super(id);
        if(senha != null)
            this.senha = sha256(senha);
    }

    objectToDocument(){
        let document = super.objectToDocument();
        document["senha"] = sha256(this.senha);
        return document;
    }

    static getUsuarioLogado() {
        if( Usuario.isUsuarioLogado() ){
            let json = JSON.parse(sessionStorage.getItem("usuario"));
            if(json.id != undefined && json.perfil != undefined){
                let usuario = new Usuario(json.id, null, null, json.perfil);
                return usuario;
            }else{
                throw new Error("Usuário não foi logado corretamente, não há id e/ou perfil informados.");
            }
            
        }
        
        return null;
    }

    static logar(usuario: Usuario) {

        return new Observable(observer=>{
                Usuario.getAll([new Query("email", "==", usuario.email), new Query("senha", "==", usuario.senha)]).subscribe(resultado=>{
                    if(resultado.length > 0){
                        sessionStorage.setItem('usuario', JSON.stringify({id:resultado[0].id, perfil:resultado[0].perfil}));
                        observer.next(true);
                        observer.complete();
                    }else{
                        observer.next(false);
                        observer.complete();
                    }
                }, err=>{
                    alert("Erro ao tentar realizar login: "+err.toString());
                });
        });
    }

    static isUsuarioLogado() {
        return sessionStorage.getItem("usuario") != undefined ? true : false;
    }

    static logout(){
        sessionStorage.removeItem("usuario");
        return true;
    }

}