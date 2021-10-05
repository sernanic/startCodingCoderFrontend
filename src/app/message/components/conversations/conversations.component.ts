import { SeoService } from './../../../shared/services/seo.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConversationService } from '../../services/conversation.service';
import { SocketService } from '../../services/socket.service';
// import { PusherService } from '../../services/pusher.service';

@Component({
  templateUrl: './conversations.html'
})
export class ConversationsComponent implements OnInit, OnDestroy {
  public originalConversations: any = [];
  public conversations: any = [];
  private currentUser: any;
  public activeConversation: any;
  public q: any = '';

  constructor(
    private route: ActivatedRoute,
    private service: ConversationService,
    private socket: SocketService,
    private seoService: SeoService
  ) {
    seoService.update('Messages');
    this.currentUser = route.snapshot.data.currentUser;
    // this.originalConversations = route.snapshot.data.conversations;
    this.conversations = this.mapConversationName(route.snapshot.data.conversations);
    this.originalConversations = this.conversations;
    // pusher.messages.subscribe(data =>
    //   this.conversations.forEach(conversation => {
    //     if (conversation._id === data.conversationId) {
    //       conversation.lastMessage = data;
    //     }
    //   })
    // );
    this.socket.getMessage(msg => {
      if (this.activeConversation && this.activeConversation._id === msg.conversationId) {
        this.activeConversation.lastMessage = msg;
        return;
      } else {
        this.conversations.map(c => {
          if (c._id === msg.conversationId) {
            c.userMeta.unreadMessage += 1;
            c.lastMessage = msg;
          }
        });
      }
    });
  }

  ngOnInit() {
    this.socket.connect();
  }

  mapConversationName(conversations: any = []) {
    return conversations.map(conversation => {
      const member = (conversation.members || []).filter(m => m._id !== this.currentUser._id);
      conversation.name = member.length ? member[0].name : this.currentUser.name;
      conversation.member = member.length ? member[0] : this.currentUser;
      return conversation;
    });
  }

  selectConversation(conversation: any) {
    this.activeConversation = conversation;
    this.service.setActive(conversation);
    if (conversation && conversation.userMeta && conversation.userMeta.unreadMessage > 0) {
      this.service
        .read(conversation._id, { all: true })
        .then(resp => {
          if (resp && resp.data && resp.data.success) {
            conversation.userMeta.unreadMessage = 0;
          }
        })
        .catch(err => console.log(err));
    }
  }

  filter() {
    this.conversations = this.originalConversations.filter(
      conversation => conversation.name.toLowerCase().indexOf(this.q) > -1
    );
  }

  enterToSend(event) {
    if (event.charCode === 13) {
      this.filter();
    }
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }
}
